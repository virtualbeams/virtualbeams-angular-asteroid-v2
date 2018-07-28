import { Injectable, Inject, EventEmitter } from '@angular/core';

import ObjectValues from 'object.values';

import { VbaUtils } from '../services/vbaUtils';
import { VbaConfigConst } from '../config/vbaConfig';
import { VBAsteroid } from '../models/vbaAsteroid';
import { Map } from 'immutable';
import { ISubscriptionObservable, IConfigSubscribe, IConfigLogin, IConfigCall } from '../models/vbaISubscriptionObservable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const ADDED = 'added';
const CHANGED = 'changed';
const REMOVED = 'removed';
const STOPPED = 'stopped';
const SUBSCRIBE = 'subscribe';
const LOGOUT = 'logout';
const INTERNAL_SERVER_ERROR = 500;

@Injectable()
export class VbaService {

  public asteroid: any;
  public subscribeObservables: any = {};

  // Events
  public VbaAsteroidLogin: EventEmitter<any>;
  public VbaAsteroidLogout: EventEmitter<any>;
  public VbaAsteroidLoginError: EventEmitter<any>;
  public VbaAsteroidConnected: EventEmitter<any>;
  public VbaAsteroidDisconnected: EventEmitter<any>;
  public VbaAsteroidReconnected: EventEmitter<any>;

  // Bhs
  public bhSLogin: BehaviorSubject<string>;
  public bhSLogout: BehaviorSubject<string>;
  public bhSLoginError: BehaviorSubject<string>;
  public bhSConnected: BehaviorSubject<string>;
  public bhSDisconnected: BehaviorSubject<string>;
  public bhSReconnected: BehaviorSubject<string>;

  /**
  * Init the vbaService.
  * @classdesc This is a asteroid implementation of Angular.
  */
  constructor(
    public vbaUtils: VbaUtils,
    @Inject('vbaConfigConst')
    private vbaConfigConst: VbaConfigConst
  ) {
    this.VbaAsteroidLogin = new EventEmitter();
    this.VbaAsteroidLogout = new EventEmitter();
    this.VbaAsteroidConnected = new EventEmitter();
    this.VbaAsteroidDisconnected = new EventEmitter();
    this.VbaAsteroidReconnected = new EventEmitter();
    this.VbaAsteroidLoginError = new EventEmitter();

    this.bhSLogin = new BehaviorSubject('');
    this.bhSLogout = new BehaviorSubject('');
    this.bhSLoginError = new BehaviorSubject('');
    this.bhSConnected = new BehaviorSubject('');
    this.bhSDisconnected = new BehaviorSubject('');
    this.bhSReconnected = new BehaviorSubject('');
  }

  /**
   * loginPromise is a promise to know if login required. in case of login is requried, the promise is resolve when
   * asteroid notify the login event.
   * @member VbaService#loginPromise
   * @param loginRequired {boolean} is a boolean to specific is login required.
   * @returns void promise
   */
  private loginPromise(loginRequired: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.asteroid.userId || !loginRequired) {
        resolve();
      } else {
        this.VbaAsteroidLogin.subscribe(() => {
          resolve();
        }, reject);
      }
    });
  }

  /**
   * getExtraData get the loginToken or custom extraData.
   * @member VbaService#getExtraData
   * @param extra {boolean|string} key of extraData.
   * @returns promise with extraData.
   */
  public getExtraData(extra: boolean | string): Promise<any> {
    return new Promise((resolve, reject) => {
      let key, res;

      if (extra === true) {
        this.asteroid.getLoginToken()
          .then(resolve)
          .catch(reject);
      } else if (typeof extra === 'string') {
        key = extra;
        res = localStorage[key];
        resolve(res);
      } else {
        resolve();
      }
    });
  }

  /**
   * get if call for firts time init the asteroid instance and returns the instance.
   * @member VbaService#get
   * @returns asteroid instance.
   */
  public get(): any {
    if (!this.asteroid) {
      this.asteroid = new VBAsteroid(this.vbaConfigConst.host, this.vbaConfigConst.ssl || false, this.vbaConfigConst);
      this.vbaUtils.log('asteroid', this.asteroid);

      this.asteroid.ddp.on('connected', () => {
        this.vbaUtils.log('connected');
        this.VbaAsteroidConnected.emit('virtualbeamsAsteroidConnected');
        this.bhSConnected.next('virtualbeamsAsteroidConnected');
      });

      this.asteroid.on('disconnected', () => {
        this.vbaUtils.log('disconnected');
        this.VbaAsteroidDisconnected.emit('virtualbeamsAsteroidDisconnected');
        this.bhSDisconnected.next('virtualbeamsAsteroidDisconnected');
      });

      this.asteroid.on('reconnected', () => {
        this.vbaUtils.log('reconnected');
        this.VbaAsteroidReconnected.emit('virtualbeamsAsteroidReconnected');
        this.bhSReconnected.next('virtualbeamsAsteroidReconnected');
      });

      this.asteroid.on('loggedIn', (idUser: string) => {
        this.vbaUtils.log('login', idUser);
        this.VbaAsteroidLogin.emit(idUser);
        this.bhSLogin.next('login');
      });

      this.asteroid.on('loggedOut', () => {
        this.vbaUtils.log('logout');
        if (this.vbaConfigConst.stopSubscriptionsOnLogout) {
          this.stopSubscriptions();
        }
        this.VbaAsteroidLogout.emit('virtualbeamsAsteroidLogout');
        this.bhSLogout.next('logout');
      });

      this.asteroid.on('loginError', (err: any) => {
        this.VbaAsteroidLoginError.emit(err);
        this.bhSLoginError.next(err);
      });

      this.listenForChanges();
    }
    return this.asteroid;
  }

  /**
   * login send data to login with a ddp server.
   * @member VbaService#login
   * @param config {IConfigLogin}
   * @returns promise
   */
  public login(config: IConfigLogin): Promise<any> {
    return new Promise((resolve, reject) => {
      const sendLogin: { password: any, email: any, username: any } = {
        password: config.password,
        email: undefined,
        username: undefined
      };

      const isEmail = this.isEmail(config.usernameOrEmail);

      if (isEmail) {
        sendLogin.email = config.usernameOrEmail;
      } else {
        sendLogin.username = config.usernameOrEmail;
      }

      const promise: Promise<any> = this.asteroid.loginWithPassword(sendLogin);

      this.listenForResults(this.vbaConfigConst.loginMethod || 'login', reject);

      try {
        promise.then((data) => {
          this.vbaUtils.log('login', data);
          resolve(data);
        }).catch((error) => {
          this.vbaUtils.error('login error', error);
          reject(error);
        });

      } catch (e) {
        this.vbaUtils.error(e.stack);
      }
    });
  }

  public async logout() {
    return new Promise((resolve, reject) => {
      const hasExtraData = this.checkExtraDataEnabled();

      this.getExtraData(hasExtraData).then(extraData => {
        if (hasExtraData) {
          const promise: Promise<any> = this.asteroid.logout({ extraData });

          this.listenForResults(this.vbaConfigConst.logoutMethod || 'logout', reject);

          promise.then(() => {
            this.vbaUtils.log(LOGOUT);
            resolve();
          }, (err: any) => {
            this.vbaUtils.error(err);
            reject(err);
          });
        }
      })
        .catch(reject);
    });
  }

  public call(method: string, data?: any, config?: IConfigCall): Promise<any> {
    if (!data) {
      data = {};
    }
    return new Promise((resolve, reject) => {
      const extraData = this.checkExtraDataEnabled(config);
      const loginRequired = this.checkLoginRequiredEnabled(config);

      this.getExtraData(extraData).then(extra => {
        if (extraData) {
          data.extraData = extra;
        }

        this.listenForResults(method, reject);

        this.loginPromise(loginRequired).then(() => {
          return this.asteroid.call(method, data);
        }).then((result) => {
          this.vbaUtils.log(method, result);
          resolve(result);
        }).catch((err: any) => {
          this.vbaUtils.error(method, err);
          reject(err);
        });

      });

    });
  }

  public callMultiParams(method: string, config?: IConfigCall, ...params: Array<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const loginRequired: boolean = (!config ?
        this.vbaConfigConst.loginRequiredInCalls : config.loginRequired ?
          this.vbaConfigConst.loginRequiredInCalls : config.loginRequired) || false;

      this.listenForResults(method, reject);

      this.loginPromise(loginRequired).then(() => {
        return this.asteroid.call(method, ...params);
      }).then((result) => {
        this.vbaUtils.log(method, result);
        resolve(result);
      }).catch((err: any) => {
        this.vbaUtils.error(method, err);
        reject(err);
      });

    });
  }

  public subscribe(config: IConfigSubscribe): EventEmitter<any> {
    const event = new EventEmitter();
    const subscribeName = config.nameSubscribe;
    const sendExtraData = this.vbaConfigConst.extraData || config.extraData;
    const loginRequired = (!config.loginRequired ? this.vbaConfigConst.loginRequiredInSubscribes : config.loginRequired) || false;
    config.params = config.params || {};


    this.getExtraData(sendExtraData).then((extraData) => {
      config.params.extraData = extraData;
      this.loginPromise(loginRequired).then(() => {
        const subscription = this.asteroid.subscribe(config.nameSubscribe, config.params);
        const observable: ISubscriptionObservable = {
          subscription: subscription,
          event: event,
          config: config
        };

        this.subscribeObservables[subscribeName] = observable;

        // subscription.on('ready', () => {
        // });

        subscription.on('error', (err: any) => {
          this.vbaUtils.error(subscribeName, err);
          delete this.subscribeObservables[subscribeName];
        });

        return subscription.ready;
      }).then(() => {
        this.vbaUtils.log(subscribeName, SUBSCRIBE);
      });
    }).catch(err => console.error());

    return event;
  }

  public getSubscription(config: any) {
    const subscriptionsObjects = this.asteroid.subscriptions;
    const subscribeNames = Object.keys(subscriptionsObjects);

    return subscribeNames.find((name: string) => {
      const subscription = subscriptionsObjects[name];
      if (subscription._name === config.nameSubscribe) {
        return true;
      }
      return false;
    });
  }

  public stopOnlySubscription(nameSubscription: string) {
    const subscribeObservable = this.subscribeObservables[nameSubscription];
    if (subscribeObservable) {
      const idSubscription = subscribeObservable.subscription.id;
      this.asteroid.unsubscribe(idSubscription);
      // this.subscribeObservables[nameSubscription].unsubscribe();
      delete this.subscribeObservables[nameSubscription];
      this.vbaUtils.log(nameSubscription, STOPPED);
    }
  }

  public stopSubscriptions() {
    const keys = Object.keys(this.subscribeObservables);
    for (const key of keys) {
      this.stopOnlySubscription(key);
    }
  }

  private isEmail(string: string) {
    return string.indexOf('@') !== -1;
  }

  private notify(subscribeName: string, config: any, eventEmmiter: EventEmitter<any>, result: Array<any>) {
    if (typeof config.filter === 'function') {
      result = config.filter(result);
    }
    if (config.reverse) {
      result.reverse();
    }
    this.vbaUtils.log(subscribeName, CHANGED, result);
    eventEmmiter.emit(result);
  }

  private notifyEvents(subscribeName: string, config: any, eventEmmiter: EventEmitter<any>, document: any, event: string, _id: string) {
    this.vbaUtils.log(subscribeName, event, document);
    const result = {
      values: document,
      event: event,
      _id: _id
    };
    eventEmmiter.emit(result);
  }

  private listenForChanges() {
    this.asteroid.on('collections:change', (event: string, collection: string, _id: string) => {
      const subscribeObservable: ISubscriptionObservable = this.subscribeObservables[collection];

      if (subscribeObservable) {
        const collectionMap: Map<any, any> = this.asteroid.collections.get(collection);
        if (!subscribeObservable.config.notifyEvents) {
          const data = collectionMap.toJS();
          const values = ObjectValues(data);
          this.notify(collection, subscribeObservable.config, subscribeObservable.event, values);
        } else {
          let value;
          if (event !== REMOVED) {
            value = collectionMap.get(_id).toJS();
          }
          this.notifyEvents(collection, subscribeObservable.config, subscribeObservable.event, value, event, _id);
        }
      }
    });
  }

  private listenForResults(methodName: string, reject: any) {
    this.asteroid.ddp.on('result', (result: any) => {
      if (result.error && result.error.error === INTERNAL_SERVER_ERROR) {
        this.vbaUtils.error(methodName, result.error);
        reject(result.error);
      }
    });
  }

  private checkExtraDataEnabled(config?: IConfigCall | IConfigSubscribe): boolean {
    return !config ? this.vbaConfigConst.extraData : config.extraData;
  }

  private checkLoginRequiredEnabled(config?: IConfigCall): boolean {
    return (!config ?
      this.vbaConfigConst.loginRequiredInCalls : config.loginRequired ?
        this.vbaConfigConst.loginRequiredInCalls : config.loginRequired) || false;
  }

  private checkLoginRequiredInSubsEnabled(config: IConfigSubscribe): boolean {
    return (!config.loginRequired ? this.vbaConfigConst.loginRequiredInSubscribes : config.loginRequired) || false;
  }

}
