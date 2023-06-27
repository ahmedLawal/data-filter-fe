/// <reference lib="webworker" /> 

addEventListener('message', ({ data }) => {
  let obj = data.obj;
  // debugger; 
  const blobGen = (dt) => {
    return new Blob([JSON.stringify(obj)], { type: 'application/json' });
  };

  postMessage({
    result: {
      blob: blobGen(obj),
    },
    progress: 100,
  });
});
