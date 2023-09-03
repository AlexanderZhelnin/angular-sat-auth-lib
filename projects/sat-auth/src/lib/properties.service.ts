import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { ILoginData, ISATAuth, SATAUTH_OPTIONS } from './sat-auth.service';
import { map, shareReplay, take } from 'rxjs/operators';
import { Router } from '@angular/router';

/** Интерфейс свойств входа со всеми установленными свойствами */
export interface IExSATAuth extends ISATAuth
{
  loginData: () => Observable<ILoginData>;
  logon: () => void;
}
/** Внутренний сервис для передачи данных */
@Injectable({ providedIn: 'root' })
export class PropertiesService
{
  /** Данные авторизации */
  public login$ = new Subject<{ name: string, password: string }>();
  /** Завершение авторизации по токену обновления, необходим что бы пока не прошёл вход по токену обновления, не было попыток перехода по страницам */
  public refreshCompleted$ = new BehaviorSubject(false);

  /** Ошибки авторизации */
  public errorLogin$ = new Subject<string>();

  /** Свойства авторизации */
  public options$: Observable<IExSATAuth>;
  /** Получение токена авторизации */
  public accessToken: () => Observable<string> = () => new BehaviorSubject('');
  /** Получение данных входа по умолчанию */
  private defaultLoginData: () => Observable<ILoginData>;
  /** Действие успешного входа по умолчанию */
  private defaultLogon: () => void

  constructor(
    @Inject(SATAUTH_OPTIONS) options: Observable<ISATAuth>,
    private readonly router: Router
  )
  {
    // Действие успешного входа по умолчанию - переход на стартовый адрес
    this.defaultLogon = () =>
    {
      this.router.navigate(['/']);
    };

    // Получение данных входа по умолчанию переход на страницу ввода логина и пароля
    this.defaultLoginData = () =>
    {
      this.router.navigate(['/login']);
      return this.login$;
    };

    // Подготавливаем закешированный поток со свойствами авторизации
    this.options$ = options.pipe(
      map(option =>
      {
        // Добавляем адреса без авторизации
        const tokenServiceUrl = option.tokenServiceUrl.toLowerCase();
        const urlWithoutAuth = new Map<string, boolean>([
          [`${tokenServiceUrl}/token`, true],
          [`${tokenServiceUrl}/logout`, true],
          ['/assets', true]
        ]);

        return {
          ...option,
          // Устанавливаем функцию проверки адреса без авторизации
          canExecuteWithoutAuth: (url: string): boolean =>
          {
            if (urlWithoutAuth.has(url.toLowerCase())) return true;
            return option.canExecuteWithoutAuth?.(url) ?? false;
          },
          // Устанавливаем функцию успешного входа
          logon: option.logon ?? this.defaultLogon,
          // Устанавливаем функцию получения данных входа
          loginData: option.loginData ?? this.defaultLoginData
        };
      }),
      // Кэшируем результат, что бы выполнить один раз
      shareReplay(1));
  }

  /** Для того что бы не оставались подписки */
  public options(): Observable<IExSATAuth>
  {
    return this.options$.pipe(take(1));
  }
}
