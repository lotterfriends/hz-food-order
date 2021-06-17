import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

interface PrintState {
  name: string;
  url: string;
  code: string;
}

@Component({
  selector: 'hz-print-table',
  templateUrl: './print-table.component.html',
  styleUrls: ['./print-table.component.scss']
})
@UntilDestroy()
export class PrintTableComponent implements OnInit {
  private state$: Observable<PrintState>;
  public name = '';
  public url = '';
  public code = '';
  public elementType = NgxQrcodeElementTypes.URL;
  public correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;

  constructor(private activatedRoute: ActivatedRoute) {
    this.state$ = this.activatedRoute.paramMap.pipe(untilDestroyed(this), map(() => window.history.state));
  }

  ngOnInit(): void {
    this.state$.pipe(untilDestroyed(this)).subscribe((printState: PrintState) => {
      this.name = printState.name;
      this.url = printState.url;
      this.code = printState.code;
    });
  }

}
