import { Component } from '@angular/core';
import * as Papa from 'papaparse';
import downloader from 'js-file-download';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'data-filter-fe';
  selectFile($event: Event) {
    const startTime = Date.now();
    const input: HTMLInputElement = $event.target as any;
    const file = input.files.item(0);
    Papa.parse(file, {
      worker: true,
      complete: (r, d) => {
        const data: [string][] = r.data as any;
        const map: { [num: string]: boolean } = {};
        for (const item of data) {
          map[item[0]] = false;
        }
        const time = (Date.now() - startTime) / 1000;
        // console.log('map', map);
        this.download(map, 'csv', file.name.replace('.csv', ''));

        console.log(
          'original length: ' + data.length,
          'new length: ' + Object.keys(map).length,
          `Total time: ${time}s`
        );
        debugger;
      },
    });
  }

  download(data, type: 'json' | 'csv', filename: string) {
    const workerPath = `./worker/download-${type}.worker`;
    debugger;
    const worker = new Worker(new URL(workerPath, import.meta.url));
    worker.onmessage = ({ data }) => {
      downloader(data.result.blob, filename + '.' + type);
    };
    worker.postMessage({
      obj: data,
    });
  }
}

//true = unique
//false = already exists

if (typeof Worker !== 'undefined') {
  // Create a new
  const worker = new Worker(new URL('./app.worker', import.meta.url));
  worker.onmessage = ({ data }) => {
    console.log(`page got message: ${data}`);
  };
  worker.postMessage('hello');
} else {
  // Web Workers are not supported in this environment.
  // You should add a fallback so that your program still executes correctly.
}