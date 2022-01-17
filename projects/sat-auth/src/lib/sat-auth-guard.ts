import { PropertiesService } from './properties.service';
import { Injectable } from '@angular/core';
import
{
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  CanLoad, Route
} from '@angular/router';

import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { SATAuthService } from './sat-auth.service';

// Защитник перехода по адресам
@Injectable({ providedIn: 'root' })
export class SATAuthGuard implements CanActivate, CanLoad
{
  constructor(
    private s_login: SATAuthService,
    private s_prop: PropertiesService,
    private router: Router) { }

  /** Можно ли перейти */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>
  {
    return this.checkLogin(state.url);
  }

  /** Можно ли загрузить */
  canLoad(route: Route): Observable<boolean>
  {
    return this.checkLogin(`/${route.path}`);
  }

  /** Проверка страницы на доступ */
  checkLogin(url: string): Observable<boolean>
  {
    // Если авторизовано или страница авторизации => разрешаем
    if (this.s_login.isLogon || url == '/login')
      return new BehaviorSubject(true);

    // После завершения авторизации по токену обновления,
    // После завершения "выход" при старте true
    // в зависимости от того прошла ли авторизация либо разрешаем, либо переходим на адрес авторизации
    return this.s_prop.refreshCompleted$
      .pipe(
        // получаем только завершённые
        filter(_ => _),
        // Переходим на адрес авторизации
        map(_ =>
        {
          if (!this.s_login.isLogon)
           // Переходим на адрес авторизации
           this.router.navigate(['/login']);

          return this.s_login.isLogon;
        })
      );


  }
}
