import * as React from 'react';
import { Component, useState, useCallback, useRef, useEffect } from 'react';
import { reactive, effect, stop, ReactiveEffect, Ref, isRef } from '@vue/reactivity';

function isArray<T>(obj: T[] | unknown): obj is T[] {
  return Object.prototype.toString.apply(obj) === '[object Array]';
}

let watch_effections = [];

type WatchItem = Ref | (() => any) | WatchItem[];
export function watch(items: WatchItem, onChange: any, immediate=false) {
  if (!isArray(items)) {
    items = [].concat(items);
    const oldOnChange = onChange;
    onChange = (nv: any[], ov: any[], inv: () => void) => oldOnChange(nv[0], ov[0], inv);
  }
  const _items = items.map(it => isRef(it) ? () => it.value : it) as (() => any)[];
  let nv = [], ov = [], invs = [], inv = (fn: () => any) => invs.push(inv);
  const new_set = () => {
    ov = nv;
    nv = _items.map(it => it());
  };
  const effection = effect(new_set, {
    onTrigger: () => {
      invs.forEach(it => it());
      new_set();
      onChange(nv, ov, inv);
    }
  });
  watch_effections.push(effection);
  // effection();
  if (immediate) {
    invs.forEach(it => it());
    onChange(nv, ov, inv);
  }
  return () => stop(effection);
};

// 支持 watch, 不支持 hook, 不支持生命周期
export function defineComponent_0<
  T extends (props: Parameters<React.FC>[0]) => () => ReturnType<React.FC>
>(setup: T) {
  return (props: Parameters<T>[0]) => {
    const render = useRef<any>();
    const reactive_props = useRef<any>();
    const effections = useRef<any[]>([]);
    useEffect(() => () => effections.current.forEach(it => stop(it)), []);
    const vdom = useRef<ReturnType<ReturnType<T>>>();
    const [_, update] = useState(0);
    const force_update = useCallback(() => update((_) => _ + 1), []);
    if (!render.current) {
      reactive_props.current = reactive({ ...props }) as any;
      watch_effections = effections.current;
      render.current = setup(reactive_props.current) as any;
      watch_effections = [];
      const render_effection = effect(render.current, {
        lazy: true,
        onTrigger: () => {
          vdom.current = render_effection();
          force_update();
        },
        scheduler: _ => null,
      });
      effections.current.push(render_effection);
      vdom.current = render_effection();
    } else {
      Object.assign(reactive_props.current, props);
    }
    return vdom.current;
  };
}

// 支持 watch, 支持 hook, 不支持生命周期
export function defineComponent_1<
  T extends (props: Parameters<React.FC>[0]) => () => ReturnType<React.FC>
>(setup: T) {
  return (props: Parameters<T>[0]) => {
    const render = useRef<any>();
    const reactive_props = useRef<any>();
    const effections = useRef<any[]>([]);
    useEffect(() => () => effections.current.forEach(it => stop(it)), []);
    const [_, update] = useState(0);
    const force_update = useCallback(() => update((_) => _ + 1), []);
    if (!render.current) {
      reactive_props.current = reactive({ ...props }) as any;
      watch_effections = effections.current;
      render.current = setup(reactive_props.current) as any;
      watch_effections = [];
      const render_effection = effect(render.current, {
        lazy: true,
        onTrigger: force_update,
        scheduler: _ => null,
      });
      effections.current.push(render_effection);
    } else {
      Object.assign(reactive_props.current, props);
    }
    return effections.current.slice(-1)[0]() as ReturnType<ReturnType<T>>;
  };
}


// export default function defineComponent<T extends (props: any, getCurrentInstance: () => any) => (ref?: any) => React.ReactNode>(setup: T) {
//   const clazz = class extends Component {
//     name = setup.name;
//     reactive_props: {[k:string]: any};
//     constructor(props: any) {
//       super(props);
//       this.reactive_props = reactivity.reactive({...props});
//       this.render = setup(this.reactive_props, () => this);
//     }
//     shouldComponentUpdate() {
//       return false;
//     }

//     // componentWillReceiveProps(new_props) {
//     //   Object.assign(this._props, new_props);
//     // }
//     render() {
//       return null
//     }
//   }
//   clazz.name = setup.name;
//   return clazz;
//   // return (props, ref) => {
//   //   console.log(reactivity);
//   //   const render = useRef();
//   //   if (!render.current) {
//   //     render.current = setup();
//   //   }
//   // }
// }

// class A extends Component {
//   static getDerivedStateFromProps(props, state) {

//   }
//   // componentWillReceiveProps() {

//   // }
// }
