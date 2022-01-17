import { Injectable } from '@angular/core';

/** Хранилище данных сервиса */
@Injectable({ providedIn: 'root' })
export class LoginStorageService
{
  /** Запомнить меня, влияет на хранение данных в локальном хранилище или сессионном */
  public get rememberMe(): boolean { return localStorage.getItem('rememberMe') !== '0'; }
  public set rememberMe(value: boolean) { localStorage.setItem('rememberMe', value ? '1' : '0'); }

  /** Получить хранилище */
  private get storage(): Storage { return this.rememberMe ? localStorage : sessionStorage; }

  /** Токен обновления */
  public get refreshToken(): string { return this.storage.getItem('refreshToken') ?? ''; }
  public set refreshToken(value: string) { this.storage.setItem('refreshToken', value); }


  constructor() { }
}
