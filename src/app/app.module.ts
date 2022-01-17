import { BehaviorSubject } from 'rxjs';
import { MainComponent } from './main/main.component';
import { environment } from './../environments/environment.prod';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { SATAuthFormComponent, SATAuthModule, SATHttpInterceptorService, SATAuthGuard, SATAUTH_OPTIONS, ISATAuth, IUser } from 'sat-auth';
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
      { path: '', component: MainComponent, canActivate: [SATAuthGuard], pathMatch: 'full' },
      { path: '**', redirectTo: '/login' }

    ]),
  ],
  providers: [
    {
      provide: SATAUTH_OPTIONS, useValue: new BehaviorSubject<ISATAuth>(
        {
          // Адрес сервиса авторизации
          tokenServiceUrl: 'http://localhost:8080/auth/realms/SAT/protocol/openid-connect',
          // Идентификатор клиента
          clientId: 'DEMO',
          // Необязательная функция вызываемая по завершению авторизации
          logon: () => { },
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
    { provide: 'BASE_URL', useFactory: () => environment.baseUrl, deps: [] },
    { provide: 'token', useFactory: () => environment.baseUrl, deps: [] },
    { provide: HTTP_INTERCEPTORS, useClass: SATHttpInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule
{

}




