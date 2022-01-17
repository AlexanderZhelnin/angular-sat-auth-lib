//import { SATAuthService } from 'sat-auth';
//import { PropertiesService } from './properties.service';
import { Injectable } from '@angular/core';
import
{
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  CanLoad, Route, UrlTree
} from '@angular/router';

import { Observable, BehaviorSubject } from 'rxjs';
//import { filter, map, switchMap } from 'rxjs/operators';

// Защитник перехода по адресам
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate//, CanActivateChild, CanLoad
{
  constructor(
    //private s_login: SATAuthService,
    //private s_properties: PropertiesService,
    //private router: Router
    )
  {
    console.log('FSBder');

  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree>
  {
    return true;
  }

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean
  // {
  //   return this.checkLogin(state.url);
  // }

  // canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean
  // {
  //   return this.canActivate(route, state);
  // }

  // /** Можно ли загрузить */
  // canLoad(route: Route): Observable<boolean>
  // {
  //   return this.checkLogin(`/${route.path}`);
  // }

  /** Проверка страницы на доступ */
  checkLogin(url: string): Observable<boolean>
  {
    return new BehaviorSubject(true);
    // // Если авторизовано или страница авторизации => разрешаем
    // if (this.s_login.isLogon || url == '/login')
    //   return new BehaviorSubject(true);

    // // После завершения авторизации по токену обновления,
    // // в зависимости от того прошла ли авторизация либо разрешаем, либо переходим на адрес авторизации
    // return this.s_properties.refreshCompleted$
    //   .pipe(
    //     // получаем только завершённые
    //     filter(_ => _),
    //     // Переходим на адрес авторизации
    //     map(_ =>
    //     {
    //       if (this.s_login.isLogon)
    //         // Если авторизовано разрешаем адрес
    //         return true;
    //       else
    //       {
    //         // Переходим на адрес авторизации
    //         this.router.navigate(['/login']);
    //         // Запрещаем текущий адрес
    //         return false;
    //       }
    //     })
    //   );


  }
}
