# Проект с библиотекой авторизации

Форма авторизации использует material компоненты, поэтому не забываем подключать стиль
в angular.json раздел "styles" необходимо добавить стиль, например
"./node_modules/material-design-icons/iconfont/material-icons.css"


import { SATAuthFormComponent, SATAuthModule, SATHttpInterceptorService, SATAuthGuard, SATAUTH_OPTIONS, ISATAuth, IUser } from 'sat-auth';

// для работы нужно зарегистрировать зависимость SATAUTH_OPTIONS
providers: [
  {
     provide: SATAUTH_OPTIONS, useValue: new BehaviorSubject<ISATAuth>(
        {
          // Адрес сервиса авторизации
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
    // Регистрируем интерсептор авторизации
    { provide: HTTP_INTERCEPTORS, useClass: SATHttpInterceptorService, multi: true }
  }
]
