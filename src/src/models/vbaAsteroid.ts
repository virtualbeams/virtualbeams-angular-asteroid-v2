import { createClass } from 'asteroid';
import immutableCollectionMixin from 'asteroid-immutable-collections-mixin';
import { onLogin, onLogout, resumeLogin } from './vbaAsteroidLogin';

export const Asteroid = createClass([immutableCollectionMixin]);

const WSS = 'wss:';
const WS = 'ws:';

export class VBAsteroid extends Asteroid {
  public loginMethod: string;
  public logoutMethod: string;

  constructor(host: string, ssl: boolean, config: any) {
    let params = {
      endpoint: `${ssl ? WSS : WS}//${host}/websocket`
    };
    super(params);
    this.loginMethod = config._loginMethod || 'login';
    this.logoutMethod = config._logoutMethod || 'logout';
  }


  public login(loginParameters: any) {
    return super.call(this.loginMethod, loginParameters).then(onLogin.bind(this));
  }

  public vbaLoginWithPassword(options: any) {

    return new Promise((resolve, reject) => {
      var username = options.username;
      var email = options.email;
      var password = options.password;

      var loginParameters = {
        password: password,
        user: {
          username: username,
          email: email
        }
      };

      let loginPromise = super.call(this.loginMethod, loginParameters).then(onLogin.bind(this));

      loginPromise.then((result) => {
        console.log('ten', result);
        resolve(result);
      }).catch((err) => {
        console.error('catch', err);
        reject(err);
      });

    });

  }

  logout() {
    return super.call(this.logoutMethod).then(onLogout.bind(this));
  }
}
