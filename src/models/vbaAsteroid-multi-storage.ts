const genericStorage: any = {};


export function get(key: string): any {
  return new Promise((resolve, reject) => {
    if (typeof localStorage !== 'undefined') {
      resolve(localStorage[key]);
    } else {
      resolve(genericStorage[key]);
    }
  });
}

export function set(key: string, value: any) {
  return new Promise((resolve, reject) => {
    if (typeof localStorage !== 'undefined') {
      localStorage[key] = value;
      resolve();
    } else {
      genericStorage[key] = value;
      resolve();
    }
  });
}

export function del(key: string) {
  return new Promise((resolve, reject) => {
    if (typeof localStorage !== 'undefined') {
      delete localStorage[key];
      resolve();
    } else {
      delete genericStorage[key];
      resolve();
    }
  });
}
