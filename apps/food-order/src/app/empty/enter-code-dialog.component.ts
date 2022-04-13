import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PublicTableService } from '../public-table.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'hz-order-message-dialog',
  template: `
    <div mat-dialog-content>
      <mat-form-field fxFlexFill class="">
        <mat-label>Code</mat-label>
        <input #code type="text" minlength="6" maxlength="6" 
          autocomplete="off" [formControl]="codeFormControl" [errorStateMatcher]="matcher"
          placeholder="Tisch-Code" matInput>
        <span matSuffix>{{code.value?.length || 0}}/6</span>
        <mat-error *ngIf="codeFormControl.hasError('minlength')">
          Der Code ist zu kurz
        </mat-error>
        <mat-error *ngIf="codeFormControl.hasError('maxlength')">
          Der Code ist zu lang
        </mat-error>
        <mat-error *ngIf="codeFormControl.hasError('invalidCode')">
          Der Code war leider nicht korrekt
        </mat-error>
      </mat-form-field>
    </div>
  `,
})
export class EnterCodeDialogComponent {

  codeFormControl = new FormControl('', [
    Validators.minLength(6),
    Validators.maxLength(6),
  ], [this.validateCode.bind(this)]);

  matcher = new MyErrorStateMatcher();

  constructor(
    public dialogRef: MatDialogRef<EnterCodeDialogComponent>,
    private publicTableService: PublicTableService,
    // @Inject(MAT_DIALOG_DATA) public data: {},
  ) {}

  validateCode(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (ctrl.value.length && ctrl.value.length === 6) {
      return this.publicTableService.getSecretForCode(ctrl.value).pipe(
        map(code => {
          if (code) {
            location.href = PublicTableService.URL_PREFIX + code.hash;
            return null;
          }
          return {invalidCode: true};
        }),
        catchError(() => of(null))
      );
    } else {
      return of({invalidCode: true});
    }
  }

}
