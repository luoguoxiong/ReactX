export const isObject = (obj: any) => Object.prototype.toString.call(obj) === '[object Object]';

export const isFunction = (obj: any) => Object.prototype.toString.call(obj) === '[object Function]';

export const isAsyncFunction = (obj: any) => Object.prototype.toString.call(obj) === '[object AsyncFunction]';

export const cloneObj = (object: object) => {
  const newObj = object.constructor();
  if(!isObject(object)){
    return;
  }
  for(const key in object){
    if(isObject(object[key])){
      newObj[key] = cloneObj(object[key]);
    }else{
      newObj[key] = object[key];
    }
  }
  return newObj;
};

