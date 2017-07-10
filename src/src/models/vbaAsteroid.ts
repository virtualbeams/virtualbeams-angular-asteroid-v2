import { createClass } from 'asteroid';
import immutableCollectionMixin from 'asteroid-immutable-collections-mixin';
import { onLogin, onLogout, resumeLogin } from './vbaAsteroidLogin';
import * as multiStorage from './vbaAsteroid-multi-storage';


export const Asteroid = createClass([immutableCollectionMixin]);

const WSS = 'wss:';
const WS = 'ws:';

export class VBAsteroid extends Asteroid {
  public loginMethod: string;
  public logoutMethod: string;
  public resumeMethod: string;
  public endpoint: string;
  public userId: string;
  public loggedIn: boolean;
  public ddp: any;

  constructor(host: string, ssl: boolean, config: any) {
    let params = {
      endpoint: `${ssl ? WSS : WS}//${host}/websocket`
    };
    super(params);
    this.init();
    this.loginMethod = config._loginMethod || 'login';
    this.logoutMethod = config._logoutMethod || 'logout';
    this.resumeMethod = config._resumeMethod || 'login';
  }


  public login(loginParameters: any) {
    return super.call(this.loginMethod, loginParameters).then(onLogin.bind(this));
  }

  public resumeLogin() {
    return new Promise((resolve, reject) => {
      this.getLoginToken().then(loginToken => {
        super.call(this.resumeMethod, { resume: loginToken }).then(res => {
          resumeLogin.bind(this);
          this.userId = res.id;
          super.emit("loggedIn", res);
          resolve(res);
        }).catch(err => {
          reject(err);
          super.emit("loginError");
        });
      }).catch(err => {
        super.emit("loginError");
        reject(err);
      });
    });
  }


  public loginWithPassword(options: any) {

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

      super.call(this.loginMethod, loginParameters).then(onLogin.bind(this)).
        then((result) => {
          resolve(result);
        }).catch((err) => {
          reject(err);
        });

    });

  }

  logout() {
    return super.call(this.logoutMethod).then(onLogout.bind(this));
  }

  async getLoginToken() {
    const token = await multiStorage.get(this.endpoint + '__login_token__');
    return token;
  }

  public init() {
    this.userId = null;
    this.loggedIn = false;
    this.ddp.removeAllListeners('connected');
    this.ddp.on('connected', resumeLogin.bind(this));
  }
}

