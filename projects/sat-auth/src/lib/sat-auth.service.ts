import { delay } from 'rxjs/operators';
import { throwError, Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, InjectionToken } from '@angular/core';
import { catchError, map, retryWhen, shareReplay, switchMap, tap } from 'rxjs/operators';
import { PropertiesService } from './properties.service';
import { LoginStorageService } from './login-storage.service';
import jwtDecode from 'jwt-decode';

/** логин и пароль */
export interface ILoginData
{
  /** логин */
  name: string;
  /** Пароль */
  password: string;
}

export interface ISATAuth
{
  /** Адрес сервиса авторизации */
  tokenServiceUrl: string;
  /** Уникальный идентификатор клиента */
  clientId: string;
  /** Получение логина и пароля */
  loginData?: () => Observable<ILoginData>;
  /** Дополнительная проверка авторизации пользователя */
  checkAuth?: (user: IUser) => string;
  /** Проверка адреса на выполнение без авторизации
   * по умолчанию система автоматически не проверяет:
   * tokenServiceUrl + '/token'
   * tokenServiceUrl + '/logout'   для упрощения логики
   * '/assets'
   */
  canExecuteWithoutAuth?: (url: string) => boolean;

  /** Функция входа */
  logon?: () => void;
}

/** Токен свойств */
export const SATAUTH_OPTIONS = new InjectionToken<Observable<ISATAuth>>('SATAUTH_OPTIONS');

/** Данные авторизованного пользователя */
export interface IUser
{
  login: string;
  name: string;
  roles: string[];
  email?: string;
  properties: { [key: string]: any };
}

/** Сервис авторизации */
@Injectable({ providedIn: 'root' })
export class SATAuthService
{
  /** Авторизованный пользователь */
  public user$ = new BehaviorSubject<IUser | undefined>(undefined);
  /** Токен авторизации */
  private _accessToken: string = '';

  /** Флаг авторизации */
  public get isLogon(): boolean
  {
    return this._accessToken !== '';
  }

  /** Поток получения токена авторизации */
  private _accessToken$?: Observable<string>;

  /** Идентификатор отложенной проверки обновления токена авторизации */
  private _refreshId: any;

  constructor(
    private readonly http: HttpClient,
    private readonly s_prop: PropertiesService,
    private readonly s_storage: LoginStorageService)
  {
    // Устанавливаем стрелочную функцию получения токена авторизации
    s_prop.accessToken = () =>
    {
      if (!this._accessToken$)
        this._accessToken$ = this.tokenFromLogin();

      return this._accessToken$;
    };

    // Если задан токен обновления, сначала попытка авторизоваться с его помощью
    const refreshToken = s_storage.refreshToken;
    if (refreshToken)
      // Авторизация с помощью токена обновления при не удачи авторизуется с запросом по логину и паролю
      this._accessToken$ = this.tokenFromRefresh(refreshToken);
    else
    {
      // Авторизация с помощью логина и пароля
      this._accessToken$ = this.tokenFromLogin();
      // Устанавливаем флаг завершения обновления
      this.s_prop.refreshCompleted$.next(true);
    }

    // Запускаем получение токена авторизации, что бы при необходимости произошёл запрос логина и пароля
    this._accessToken$.subscribe({ next: _ => { } });
  }

  /** Выход */
  public logout(): void
  {
    const token = this._accessToken;
    this.clear();
    this.s_prop.options$
      .pipe(
        switchMap(options =>
          token
            ? this.http.get(options.tokenServiceUrl + '/logout', { headers: { Authorization: `Bearer ${token}` } })
            : new BehaviorSubject(true)
        ),
        catchError(_ => new BehaviorSubject(true)),
        switchMap(_ => this.s_prop.accessToken()))
      .subscribe({ next: _ => { } });
  }

  /** Авторизация по логину и паролю */
  private login(username: string, password: string): Observable<any>
  {
    return this.s_prop.options$
      .pipe(
        switchMap(options =>
          this.http.post(
            options.tokenServiceUrl + '/token',
            new HttpParams()
              .set('client_id', options.clientId)
              .set('grant_type', 'password')
              .set('username', username)
              .set('password', password).toString(),
            {
              headers: new HttpHeaders()
                .set('Content-Type', 'application/x-www-form-urlencoded')
            }).pipe(tap(r => this.load(options, r)))),
        catchError((er: HttpErrorResponse) =>
        {
          switch (er.status)
          {
            case 0:
              this.s_prop.errorLogin$.next('Сервис не доступен');
              break;
            default:
              this.s_prop.errorLogin$.next('Не верное имя пользователя или пароль');
              break;
          }
          return throwError(er);
        }));
  }

  /** Авторизация по токену обновления */
  private tokenFromRefresh(refreshToken: string): Observable<string>
  {
    this.s_prop.refreshCompleted$.next(false);
    return this.s_prop.options$
      .pipe(
        switchMap(options =>
          this.http.post(
            options.tokenServiceUrl + '/token',
            new HttpParams()
              .set('client_id', options.clientId)
              .set('grant_type', 'refresh_token')
              .set('refresh_token', refreshToken).toString(),
            {
              headers: new HttpHeaders()
                .set('Content-Type', 'application/x-www-form-urlencoded')
            })
            .pipe(
              //delay(5000),
              tap(r =>
              {
                this.load(options, r);
                this.s_prop.refreshCompleted$.next(true);
              }),
              catchError(_ =>
              {
                this.s_prop.refreshCompleted$.next(true);
                return options.loginData()
                  .pipe(
                    switchMap(l => this.login(l.name, l.password)),
                    retryWhen(error => error),
                  );
              }),
              map(r => r.access_token)
            )),
        shareReplay(1));
  }

  /** Получение токена из авторизации по логину */
  private tokenFromLogin(): Observable<string>
  {
    return this.s_prop.options$
      .pipe(
        switchMap(options =>
          (options.loginData())
            .pipe(
              switchMap(l =>
                this.login(l.name, l.password)
                  .pipe(map(r => r.access_token))
              ),
              retryWhen(error => error))

        ),
        shareReplay(1));
  }

  /** Загрузка данных из токена авторизации */
  private load(options: ISATAuth, l: any): void
  {
    const decode = jwtDecode(l.access_token) as { [key: string]: any };

    const user =
    {
      name: decode.name,
      login: decode.preferred_username,
      email: decode.email,
      roles: decode.realm_access.roles,
      properties: decode
    };

    const error = options.checkAuth?.(user);
    if (!error)
    {
      // Запоминаем токен обновления
      this.s_storage.refreshToken = l.refresh_token;
      this._accessToken = l.access_token;

      // Проверку делаем за 10 секунд до окончания времени жизни
      let timeout = l.expires_in * 1000;
      if (timeout > 10000) timeout - 10000

      // Запускаем получения токена авторизации через отведённое время жизни
      this.runRefresh(timeout);

      this.user$.next(user);
      this.s_prop.errorLogin$.next('');
    }
    else
      this.s_prop.errorLogin$.next(error);
  }

  /** Запускаем получения токена авторизации через отведённое время жизни */
  private runRefresh(timeout: number)
  {
    if (this._refreshId)
      clearTimeout(this._refreshId);

    this._refreshId = setTimeout(() =>
    {
      this.clear();
      this._accessToken$ = this.tokenFromRefresh(this.s_storage.refreshToken);
      this.s_prop.accessToken().subscribe({ next: _ => { } });
    }, timeout);
  }

  /** Отчистка данных авторизации */
  private clear(): void
  {
    this._accessToken = '';
    this._accessToken$ = undefined;
  }

}
