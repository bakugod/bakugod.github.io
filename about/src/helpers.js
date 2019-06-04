const $ = selector =>
  new Proxy(
    document.querySelector(selector) || Element,{ 
        get: (target, key) => Reflect.get(target, key) 
    }
   );