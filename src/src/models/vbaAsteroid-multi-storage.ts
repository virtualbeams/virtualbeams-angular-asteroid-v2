import { Storage } from '@ionic/storage';

const genericStorage = {};
const storage = new Storage({});


export function get(key) {
  return new Promise((resolve, reject) => {
    if (storage) {
      storage.get(key).then(
        data => resolve(data),
        err => reject(err)
      );
    } else if (typeof localStorage !== 'undefined') {
      resolve(localStorage[key]);
    } else {
      resolve(genericStorage[key]);
    }
  });
}

export function set(key, value) {
  return new Promise((resolve, reject) => {
    if (storage) {
      storage.set(key, value).then(
        () => resolve(),
        err => reject(err)
      );
    } else if (typeof localStorage !== 'undefined') {
      localStorage[key] = value;
      resolve();
    } else {
      genericStorage[key] = value;
      resolve();
    }
  });
}

export function del(key) {
  return new Promise((resolve, reject) => {
    if (storage) {
      storage.remove(key).then(
        () => resolve(),
        err => reject(err)
      );
    } else if (typeof localStorage !== 'undefined') {
      delete localStorage[key];
      resolve();
    } else {
      delete genericStorage[key];
      resolve();
    }
  });
}
