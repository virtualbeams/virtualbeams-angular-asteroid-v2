import { VbaConfigConst } from './../config/vbaConfig';
import { createClass } from 'asteroid';
import immutableCollectionMixin from 'asteroid-immutable-collections-mixin';
import { onLogin, onLogout, resumeLogin } from './vbaAsteroidLogin';
import * as multiStorage from './vbaAsteroid-multi-storage';
import { vbaRestartSubscriptions } from './vbaAsteroidSubscriptions';
import { EventEmitter } from 'events';

export const Asteroid = createClass([immutableCollectionMixin]);

const WSS = 'wss:';
const WS = 'ws:';

/**
 * VBAsterod
 */
export class VBAsteroid extends Asteroid {

  /**
   * login method
   */
  public loginMethod: string;

  /**
   * logout method
   */
  public logoutMethod: string;

  /**
   * resume method
   */
  public resumeMethod: string;

  /**
   * endpoint of the ddp server
   */
  public endpoint: string;

  /**
   * user id
   */
  public userId: string;

  /**
   * boolean to know if user in session
   */
  public loggedIn: boolean;

  /**
   * ddp instance
   */
  public ddp: any;

  /**
   * custom run data
   */
  public runData: Array<string>;

  /**
    Init the VbaAsteroid.
    @classdesc override asterod methods.
    @param host {string} endpoint
    @param ssl {boolean} active ssl
    @param config {VbaConfig} set customs methods and custom data
  */
  constructor(host: string, ssl: boolean, config: VbaConfigConst) {
    const params = {
      endpoint: `${ssl ? WSS : WS}//${host}/websocket`
    };
    super(params);
    this.init();
    this.loginMethod = config.loginMethod || 'login';
    this.logoutMethod = config.logoutMethod || 'logout';
    this.resumeMethod = config.resumeMethod || 'login';
    this.runData = config.runData || [];
  }

  /**
   * login call asteroid method to login
   * @member VbaAsteroid#login
   * @param loginParameters {any}
   * @returns void promise
   */
  public login(loginParameters: any): Promise<any> {
    return super.call(this.loginMethod, loginParameters).then(onLogin.bind(this));
  }

  /**
   * resumeLogin call asteroid method to resume
   * @member VbaAsteroid#resumeLogin
   * @returns void promise
   */
  public resumeLogin(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getLoginToken().then(loginToken => {
        super.call(this.resumeMethod, { resume: loginToken }).then((res: any) => {
          resumeLogin.bind(this);

          for (let i = 0; i < this.runData.length; i++) {
            const key = this.runData[i];
            if (res[key]) {
              this[key] = res[key];
            }
          }

          this.userId = res.id;
          super.emit('loggedIn', res);
          resolve(res);
        }).catch((err: any) => {
          reject(err);
          super.emit('loginError');
        });
      }).catch(err => {
        super.emit('loginError');
        reject(err);
      });
    });
  }

  /**
  * login call asteroid method to login with password
  * @member VbaAsteroid#loginWithPassword
  * @param options {any}
  * @returns void promise
  */
  public loginWithPassword(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const username = options.username;
      const email = options.email;
      const password = options.password;

      const loginParameters = {
        password: password,
        user: {
          username: username,
          email: email
        }
      };

      super.call(this.loginMethod, loginParameters).then(onLogin.bind(this))
        .then(resolve)
        .catch(reject);
    });

  }

  /**
  * logout call asteroid method to logout
  * @member VbaAsteroid#logout
  * @returns void promise
  */
  public logout(): Promise<any> {
    return super.call(this.logoutMethod).then(onLogout.bind(this));
  }

  /**
  * getLoginToken get token of storage
  * @member VbaAsteroid#getLoginToken
  * @returns token
  */
  public async getLoginToken(): Promise<string> {
    const token = await multiStorage.get(this.endpoint + '__login_token__');
    return token;
  }

  /**
  * init remove unnessary listeners and add new listeners
  * @member VbaAsteroid#init
  */
  public init(): void {
    this.userId = '';
    this.loggedIn = false;
    this.ddp.removeAllListeners('connected');
    this.ddp.on('connected', resumeLogin.bind(this));
    vbaRestartSubscriptions.bind(this)();
  }

}

