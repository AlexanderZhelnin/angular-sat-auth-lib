import { Guid } from 'guid-typescript';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';
import { PropertiesService } from './properties.service';


/** Главный интерсептор */
@Injectable()
export class SATHttpInterceptorService implements HttpInterceptor
{
  constructor(private s_prop: PropertiesService) { }

  /** Обработчик */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
  {
    // Получение данных из assets выполняем без авторизации
    // Это даёт возможность получить например настройки
    if (req.url.startsWith('\assets'))
      return next.handle(req);

    // После получения настроек выполняем
    return this.s_prop.options()
      .pipe(
        first(),
        switchMap(options =>
          // Проверяем адрес
          options.canExecuteWithoutAuth?.(req.url)
            // Если адрес разрешён без авторизации выполняем
            ? next.handle(req)
            // Получаем токен авторизации и выполняем с ним
            : this.s_prop.accessToken()
              .pipe(
                switchMap(token =>
                {
                  // Передаём уникальный идентификатор запроса
                  const TraceId = Guid.create().toString();
                  req = req.clone({ setHeaders: { TraceId } })

                  // jwt токен авторизации
                  if (!!token)
                    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
                  return next.handle(req);

                }))
        ));

    //return next.handle(req);//.pipe(delayRetryPipe());
  }
}
