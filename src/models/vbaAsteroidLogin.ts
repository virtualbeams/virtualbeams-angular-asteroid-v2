import * as multiStorage from './vbaAsteroid-multi-storage';

export function onLogin(result: any) {
  const _this: any = this;
  _this.userId = result.id;
  _this.loggedIn = true;

  for (let i = 0; i < _this.runData.length; i++) {
    const key = _this.runData[i];
    if (result[key]) {
      _this[key] = result[key];
    }
  }

  return multiStorage.set(_this.endpoint + '__login_token__', result.token)
    .then(_this.emit.bind(_this, 'loggedIn', result))
    .then(() => result);
}

export function onLogout() {
  const _this: any = this;

  _this.userId = null;
  _this.loggedIn = false;

  for (let i = 0; i < _this.runData.length; i++) {
    const key = _this.runData[i];
    delete _this[key];
  }

  return multiStorage.del(_this.endpoint + '__login_token__')
    .then(_this.emit.bind(_this, 'loggedOut'))
    .then(() => null);
}

export function resumeLogin() {
  const _this: any = this;
  return multiStorage.get(_this.endpoint + '__login_token__')
    .then(resume => {
      if (!resume) {
        throw new Error('No login token');
      }
      return { resume };
    })
    .then((res) => {
      _this.login.bind(_this);
    })
    .catch((err) => {
      onLogout.bind(_this);
    });
}
