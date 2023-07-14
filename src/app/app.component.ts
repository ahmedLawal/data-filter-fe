import { Component } from '@angular/core';
import * as Papa from 'papaparse';
import downloader from 'js-file-download';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'data-filter-fe';
  listToFilterName = 'list-to-filter';
  checkFromListName = 'check-from-list';

  constructor(
    public http: HttpClient,
    public currencyPipe: CurrencyPipe,
    public decimalPipe: DecimalPipe
  ) {}
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.groupCheckFromLists();
    // this.groupListToFilter();
    // this.analyse();
    // this.http
    //   .get<{ [num: string]: boolean }>(
    //     `/assets/data/formatted/list-to-filter-1.json`
    //   )
    //   .subscribe((r) => {
    //     // debugger;
    //     this.download(r, 'csv', 'test');
    //   });
  }

  analyse() {
    forkJoin(
      [this.checkFromListName, this.listToFilterName].map((name) =>
        this.http.get<{ [num: string]: boolean }>(
          `/assets/data/formatted/${name}-grouped.json`
        )
      )
    ).subscribe((r) => {
      const checkFromList = r[0];
      const listToFilter = r[1];
      const analysis: {
        alreadyExistsList: [string][];
        doesntExistsList: [string][];
      } = { alreadyExistsList: [], doesntExistsList: [] };
      for (const num in listToFilter) {
        if (checkFromList[num] != null) analysis.alreadyExistsList.push([num]);
        else analysis.doesntExistsList.push([num]);
        delete listToFilter[num];
      }
      debugger;

      for (const batchName in analysis) {
        this.download(analysis[batchName], 'csv', batchName);
      }
    });
  }

  groupCheckFromLists() {
    const fileNames: string[] = [];
    for (let index = 1; index <= 4; index++) {
      fileNames.push(this.checkFromListName + '-' + index);
    }
    // debugger;
    forkJoin(
      fileNames.map((name) =>
        this.http.get<{ [num: string]: boolean }>(
          `/assets/data/formatted/${name}.json`
        )
      )
    ).subscribe((r) => {
      let group: { [num: string]: boolean } = {};
      let total = 0;
      for (const batch of r) {
        // for (const num in batch) {
        //   if (Object.prototype.hasOwnProperty.call(object, num)) {
        //     const element = object[num];
        //   }
        // }
        console.log('original length: ' + Object.keys(batch).length);
        total += Object.keys(batch).length;
        group = { ...group, ...batch };
      }
      const groupedTotal = Object.keys(group).length;
      console.log(
        'original length: ' + total,
        'new length: ' + groupedTotal,
        'difference: ' + (total - groupedTotal)
      );
      // this.download(group, 'json', this.checkFromListName+'-grouped');
      // debugger;
    });
  }

  groupListToFilter() {
    const fileNames: string[] = [];
    for (let index = 1; index <= 7; index++) {
      fileNames.push(this.listToFilterName + '-' + index);
    }
    // debugger;
    forkJoin(
      fileNames.map((name) =>
        this.http.get<{ [num: string]: boolean }>(
          `/assets/data/formatted/${name}.json`
        )
      )
    ).subscribe((r) => {
      let group: { [num: string]: boolean } = {};
      let total = 0;
      for (const batch of r) {
        // for (const num in batch) {
        //   if (Object.prototype.hasOwnProperty.call(object, num)) {
        //     const element = object[num];
        //   }
        // }
        console.log('original length: ' + Object.keys(batch).length);
        total += Object.keys(batch).length;
        group = { ...group, ...batch };
      }
      const groupedTotal = Object.keys(group).length;
      console.log(
        'original length: ' + total,
        'new length: ' + groupedTotal,
        'difference: ' + (total - groupedTotal)
      );
      this.download(group, 'json', this.listToFilterName + '-grouped');
      // debugger;
    });
  }

  selectFile($event: Event) {
    const input: HTMLInputElement = $event.target as any;
    // const file = input.files.item(0);
    for (const file of Array.from(input.files)) {
      const startTime = Date.now();
      Papa.parse(file, {
        worker: true,
        fastMode: true,
        skipEmptyLines: 'greedy',
        preview: 100,
        complete: (r, d) => {
          const data: [string][] = r.data as any;
          const map: { [num: string]: boolean } = {};
          for (const item of data) {
            let num = item[0];
            if (num.startsWith('234')) num = '0' + num.slice(3);
            else if (num[0] != '0') num = '0' + num;
            map[num] = false;
          }
          const time = (Date.now() - startTime) / 1000;
          console.log('map', map);
          // this.download(map, 'json', file.name.replace('.csv', ''));

          console.log(
            'original length: ' + data.length,
            'new length: ' + Object.keys(map).length,
            `Total time: ${time}s for ${file.name}`
          );
          // debugger;
        },
      });
    }
  }

  selectFileConcatenatedly($event: Event) {
    const input: HTMLInputElement = $event.target as any;
    // const file = input.files.item(0);
    for (const file of Array.from(input.files)) {
      const startTime = Date.now();
      Papa.parse(file, {
        worker: true,
        fastMode: true,
        skipEmptyLines: 'greedy',
        // preview:100,
        complete: (r, d) => {
          const data: string[][] = r.data as any;
          const originalLength = r.data.length;
          const errorData: string[][] = [];
          const map: { [num: string]: string[] } = {};
          while (data.length) {
            const item = data.pop();
            let num = item[1];
            if (!+num) {
              errorData.push(item);
              continue;
            }
            // if (num.startsWith('234')) num = '0' + num.slice(3);
            // else if (num[0] != '0') num = '0' + num;
            // let numNin=num+'~~~'+item[1]
            // if(map[numNin])console.log(map[numNin],item)
            // map[numNin] = item;
            if (map[num] && map[num][1] != item[0]) {
              // console.log(map[num],item)

              map[num][1] = item[0];
            } else {
              item.splice(1, 0, '');
              map[num] = item;
            }
          }
          const time = (Date.now() - startTime) / 1000;
          // console.log('map', map);
          // this.download(map, 'json', file.name.replace('.csv', ''));
          const newData = Object.values(map);
          const newRowsLength = newData.length;
          console.log(
            'original rows: ' + this.formatNumber(originalLength),
            'error rows: ' + this.formatNumber(errorData.length),
            'unique rows: ' + this.formatNumber(newRowsLength),
            'duplicate records: ' +
              this.formatNumber(
                originalLength - errorData.length - newRowsLength
              ),
            `Total time: ${time}s for ${file.name}`
          );
          this.download(errorData, 'csv', `error rows (${errorData.length})`);
          this.download(newData, 'csv', `unique rows (${newRowsLength})`);
          // debugger;
        },
      });
    }
  }
  formatNumber = (num) => this.decimalPipe.transform(num);

  download(data, type: 'json' | 'csv', filename: string) {
    if (typeof Worker !== 'undefined') {
      // debugger;
      let worker;
      if (type == 'json')
        worker = new Worker(
          new URL(`./workers/download-json.worker`, import.meta.url)
        );
      else if (type == 'csv')
        worker = new Worker(
          new URL(`./workers/download-csv.worker`, import.meta.url)
        );
      worker.onmessage = ({ data }) => {
        downloader(data.result.blob, filename + '.' + type);
      };
      worker.postMessage({
        obj: data,
      });
    }
  }
}

//true = unique
//false = already exists

// if (typeof Worker !== 'undefined') {
//   // Create a new
//   const worker = new Worker(new URL('./app.worker', import.meta.url));
//   worker.onmessage = ({ data }) => {
//     console.log(`page got message: ${data}`);
//   };
//   worker.postMessage('hello');
// } else {
//   // Web Workers are not supported in this environment.
//   // You should add a fallback so that your program still executes correctly.
// }
