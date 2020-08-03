import * as React from 'react';
import { Component, useState, useCallback, useRef, useEffect } from 'react';
import { render } from 'react-dom';
import { reactive, effect, stop, ReactiveEffect, ref } from '@vue/reactivity';
import { defineComponent_0, watch, defineComponent_1 } from '../index';

let App: any = () => {
  return <div>JSX OK</div>;
};

// (() => {
//   // defineComponent_0: render 函数中没有生命周期, 不能用 hooks api
//   const a = ref(0);
//   const b = ref(1);
//   setInterval(() => {
//     a.value += 2;
//     b.value += 2;
//   }, 1e3);
//   const g = (window as any)._g = ref(100);
  
//   App = defineComponent_0((props) => {
//     const c = ref(0);
//     watch(g, nv => {
//       if (nv % 2 === 0) {
//         c.value += 2;
//       } else {
//         c.value += 1;
//       }
//     })
//     return () => {
//       return (
//         <div>
//           <div onClick={(_) => c.value++}>{c.value}</div>
//           <div>{c.value % 2 === 0 ? a.value : b.value}</div>
//         </div>
//       );
//     };
//   });
// })();

(() => {
  // defineComponent_0: render 函数中没有生命周期, 不能用 hooks api
  const a = ref(0);
  const b = ref(1);
  setInterval(() => {
    a.value += 2;
    b.value += 2;
  }, 1e3);
  const g = (window as any)._g = ref(100);
  
  App = defineComponent_1((props) => {
    const c = ref(0);
    watch(g, (nv, ov, inv) => {
      console.log(nv, ov, inv);
      inv(() => console.log('old nv:', nv));
      if (nv % 2 === 0) {
        c.value += 2;
      } else {
        c.value += 1;
      }
    })
    return () => {
      const [w, sw] = useState(0);
      return (
        <div>
          <div onClick={(_) => c.value++}>{c.value}</div>
          {/* <div>{c.value % 2 === 0 ? a.value : b.value}</div> */}
          <div onClick={_ => sw(_ => _ + 1)}>{w}</div>
        </div>
      );
    };
  });
})();

render(<App />, document.getElementById('root'));
