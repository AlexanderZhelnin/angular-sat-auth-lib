// import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
// import { Inject, Injectable } from '@angular/core';
// import jwtDecode from 'jwt-decode';
// import { Observable, of } from 'rxjs';
// import { switchMap, tap } from 'rxjs/operators';

// export interface IUser
// {
//   login: string;
//   name: string;
//   roles: string[];
//   //attributes: string[];
//   email: string;
// }

// @Injectable({ providedIn: 'root' })
// export class AuthService
// {
//   //#region accessToken
//   private _accessToken: string = '';
//   public get accessToken(): Observable<string>
//   {
//     if (this._accessToken !== '') return of(this._accessToken);
//     return this.login('zhelnin', 'qwerty')
//       .pipe(switchMap(l =>
//       {
//         this._accessToken = l.access_token;
//         this._refreshToken = l.refresh_token;

//         return of(this._accessToken);
//       }));
//   }
//   //#endregion

//   public user?: IUser;
//   private _refreshToken?: string;
//   private _expiresIn = 0;
//   private _refreshExpiresIn = 0;

//   constructor(
//     @Inject('AUTH_TOKEN_SERVICE_URL') private readonly baseUrl: string,
//     private http: HttpClient)
//   {

//   }
//   //.pipe(shareReplay(1))

//   /** Авторизация */
//   private login(username: string, password: string): Observable<any>
//   {
//     //this.username = username;
//     const body = new HttpParams()
//       .set('client_id', 'DEMO')
//       .set('grant_type', 'password')
//       .set('username', username)
//       .set('password', password);

//     return this.http.post(
//       this.baseUrl + '/token',
//       body.toString(),
//       {
//         headers: new HttpHeaders()
//           .set('Content-Type', 'application/x-www-form-urlencoded')
//       }
//     ).pipe(tap((l: any) =>
//     {
//       this._refreshToken = l.refresh_token;
//       this._expiresIn = l.expires_in;
//       this._refreshExpiresIn = l.refresh_expires_in;

//       const decode = jwtDecode(l.access_token) as any;

//       this.user = {
//         name: decode.name,
//         login: username,
//         email: decode.email,
//         roles: decode.realm_access.roles,
//         //attributes: [],
//       };

//     }));
//   }



// }
