import * as multiStorage from './vbaAsteroid-multi-storage';

export function onLogin(result: any) {
  this.userId = result.id;
  this.loggedIn = true;
  return multiStorage.set(this.endpoint + '__login_token__', result.token)
    .then(this.emit.bind(this, 'loggedIn', result))
    .then(() => result);
}

export function onLogout() {
  this.userId = null;
  this.loggedIn = false;
  return multiStorage.del(this.endpoint + '__login_token__')
    .then(this.emit.bind(this, 'loggedOut'))
    .then(() => null);
}

export function resumeLogin() {
  return multiStorage.get(this.endpoint + '__login_token__')
    .then(resume => {
      if (!resume) {
        throw new Error('No login token');
      }
      return { resume };
    })
    .then((res) => {
      this.login.bind(this);
    })
    .catch((err) => {
      onLogout.bind(this);
    });
}
