/// <reference lib="webworker" />
import * as Papa from 'papaparse';

addEventListener('message', ({ data }) => {
  let file = data.data;
  // debugger
  let { columns } = data;
  const blobGen = (dt, displayedColumns) => {
    return new Blob(
      [
        `${displayedColumns.map((x) => x.t).join(',')}\r\n"` +
          dt
            .map((x) => displayedColumns.map((y) => x[y.f]).join('","'))
            .join('"\r\n"'),
      ],
      { type: 'text/csv' }
    );
  };

  postMessage({
    result: {
      blob: new Blob([Papa.unparse(file)], { type: 'text/csv' }),
    },
    progress: 100,
  });
});
