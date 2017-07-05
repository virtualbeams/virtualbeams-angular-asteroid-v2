import { NativeStorage } from '@ionic-native/native-storage';

const genericStorage = {};
const nativeStorage = new NativeStorage();


export function get(key) {
  return new Promise((resolve, reject) => {
    if (typeof localStorage !== 'undefined') {
      resolve(localStorage.getItem(key));
    } else if (typeof localStorage !== 'undefined') {
      resolve(localStorage[key]);
    } else if (nativeStorage) {
      nativeStorage.getItem(key).then(
        data => resolve(data),
        err => reject(err)
      );
    } else {
      resolve(genericStorage[key]);
    }
  });
}

export function set(key, value) {
  return new Promise((resolve, reject) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      resolve();
    } else if (typeof localStorage !== 'undefined') {
      localStorage[key] = value;
      resolve();
    } else if (nativeStorage) {
      nativeStorage.setItem(key, value).then(
        () => resolve(),
        err => reject(err)
      );
    } else {
      genericStorage[key] = value;
      resolve();
    }
  });
}

export function del(key) {
  return new Promise((resolve, reject) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      resolve();
    } else if (typeof localStorage !== 'undefined') {
      delete localStorage[key];
      resolve();
    } else if (nativeStorage) {
      nativeStorage.remove(key).then(
        () => resolve(),
        err => reject(err)
      );
    } else {
      delete genericStorage[key];
      resolve();
    }
  });
}
