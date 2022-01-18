# SATAuth Библиотека авторизации. 

[Исходный код](https://github.com/AlexanderZhelnin/angular-sat-auth-lib)

[![Видео](https://i9.ytimg.com/vi/h_p6is3H1-g/hqdefault.jpg?v=61e5cdbd&sqp=CMjPmY8G&rs=AOn4CLAcGTtiYuOnHKMszb-XXu_1YnHTEQ)](https://youtu.be/h_p6is3H1-g)

```ts
import { BehaviorSubject } from 'rxjs';
// Тут будет ваш компонент
import { MainComponent } from './main/main.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { 
  SATAuthFormComponent, 
  SATAuthModule, 
  SATHttpInterceptorService, 
  SATAuthGuard, 
  SATAUTH_OPTIONS, 
  ISATAuth, 
  IUser } from 'sat-auth';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SATAuthModule,
    RouterModule.forRoot([

      { path: 'login', component: SATAuthFormComponent, pathMatch: 'full' },
      // Тут буде ваш компонент, конечно лучше через ленивую загрузку 😉
      // Адрес защищён SATAuthGuard, без авторизации на этот адрес не возможно попасть
      { path: '', component: MainComponent, canActivate: [SATAuthGuard], pathMatch: 'full' },
      { path: '**', redirectTo: '/login' }

    ]),
  ],
  providers: [
    {
      provide: SATAUTH_OPTIONS, useValue: new BehaviorSubject<ISATAuth>(
        {
          // Адрес сервиса авторизации у вас будет свой адрес
          tokenServiceUrl: 'http://localhost:8080/auth/realms/SAT/protocol/openid-connect',
          // Идентификатор клиента
          clientId: 'DEMO',
          // Необязательная функция вызываемая по завершению авторизации
          logon: undefined, //() => { },
          // Необязательная функция проверки адреса на запрос без авторизации
          // пример: (url: string) => { return url==='/assets'; }
          canExecuteWithoutAuth: undefined,
          // Необязательная функция проверки авторизованного пользователя,
          // если возвращается не пустая строка,
          // то этот пользователь не будет авторизован, и строка будет выведена в качестве ошибки
          // пример: (user: IUser) => { return (user.roles.includes('важная роль') ? '' : 'Пользователь не поддерживает роль "важная роль"'); }
          checkAuth: undefined,
          // Необязательная функция получения логина и пароля, по умолчанию система сама имеет свою реализацию
          loginData: undefined,

        })
    },    
    { provide: HTTP_INTERCEPTORS, useClass: SATHttpInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule
{

}
```
