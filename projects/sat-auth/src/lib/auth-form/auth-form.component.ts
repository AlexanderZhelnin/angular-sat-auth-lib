import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoginStorageService } from '../login-storage.service';
import { PropertiesService } from '../properties.service';
import { SATAuthService } from '../sat-auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss']
})
export class SATAuthFormComponent implements OnInit, OnDestroy
{
  public hide = true;
  public form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
    error: new FormControl('')
  });

  private _subs: Subscription[] = [];
  constructor(
    private readonly cdRef: ChangeDetectorRef,
    private readonly s_auth: SATAuthService,
    private readonly s_prop: PropertiesService,
    public readonly s_storage: LoginStorageService)
  {

  }

  /** Инициализация контрола */
  ngOnInit(): void
  {
    this.s_auth.logout();

    this._subs.push(this.s_prop.options$
      .subscribe({
        next: options =>
          this.s_prop.accessToken()
            .subscribe({ next: options.logon })
      }));

    this._subs.push(this.s_prop.errorLogin$
      .subscribe(
        {
          next: er => this.form.get('error')?.setValue(er)
        }));
    setTimeout(() => this.cdRef.detectChanges(), 100);
  }

  /** уничтожение контрола */
  ngOnDestroy(): void
  {
    this._subs.forEach(s => s.unsubscribe());
  }

  /** Войти */
  onSubmit(): void
  {
    this.s_prop.login$.next({ name: this.form.value.name, password: this.form.value.password });
  }
}
