import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import jsQR from 'jsqr';
import { PublicTableService } from '../public-table.service';

@Component({
  selector: 'hz-scan-code-dialog',
  styleUrls: ['./scan-code-dialog.component.scss'],
  template: `
    <div mat-dialog-content>
      <div id="loadingMessage">🎥 keine Kamera erkannt (Bitte erlaube den Kamerazugriff)</div>
      <canvas id="canvas" hidden></canvas>
      <div id="output" hidden>
        <div id="outputMessage">kein QR-Code erkannt.</div>
        <div hidden><span id="outputData"></span></div>
      </div>
    </div>
  `,
})
export class ScanCodeDialogComponent implements OnInit {



  constructor(
    public dialogRef: MatDialogRef<ScanCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {},
  ) {}


  ngOnInit(): void {
    let stopScan = false;
    const video: HTMLVideoElement = document.createElement('video');
    const canvasElement: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const canvas = canvasElement.getContext('2d');
    const loadingMessage = document.getElementById('loadingMessage');
    const outputContainer = document.getElementById('output');
    const outputMessage = document.getElementById('outputMessage');
    const outputData = document.getElementById('outputData');

    function drawLine(begin, end, color) {
      canvas.beginPath();
      canvas.moveTo(begin.x, begin.y);
      canvas.lineTo(end.x, end.y);
      canvas.lineWidth = 4;
      canvas.strokeStyle = color;
      canvas.stroke();
    }

    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream) {
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true'); // required to tell iOS safari we don't want fullscreen
      video.play();
      requestAnimationFrame(tick);
    });

    function tick() {
      loadingMessage.innerText = '⌛ Lade Kamera...'
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        loadingMessage.hidden = true;
        canvasElement.hidden = false;
        outputContainer.hidden = false;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code) {
          drawLine(code.location.topLeftCorner, code.location.topRightCorner, '#FF3B58');
          drawLine(code.location.topRightCorner, code.location.bottomRightCorner, '#FF3B58');
          drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF3B58');
          drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF3B58');
        }
        if (!stopScan) {
          if (code) {
            outputMessage.hidden = true;
            outputData.parentElement.hidden = false;
            if (code.data.startsWith(PublicTableService.URL_PREFIX)) {
              stopScan = true;
              outputData.innerText = 'Code erkannt, du wirst weitergeleitet....';
              location.href = code.data;
            } else {
              outputData.innerText = 'Ungültiger Code';
            }
          } else {
            outputMessage.hidden = false;
            outputData.parentElement.hidden = true;
          }
        }
      }
      requestAnimationFrame(tick);
    }
  }


}
