import { Injectable, Inject, EventEmitter } from '@angular/core';

import ObjectValues from 'object.values';

import { VbaUtils } from '../services/vbaUtils';
import { VbaConfig } from '../config/vbaConfig';
import { VBAsteroid } from '../models/vbaAsteroid';
import { Map } from 'immutable';
import { ISuscriptionObservable, IConfigSuscribe, IConfigLogin } from '../models/vbaISuscriptionObservable';

@Injectable()
export class VbaService {

  public asteroid;
  public subscribeObservables = {};

  // Constats
  private ADDED: string = 'added';
  private CHANGED: string = 'changed';
  private REMOVED: string = 'removed';
  private STOPPED: string = 'stopped';
  private SUBSCRIBE: string = 'subscribe';
  private LOGOUT: string = 'logout';
  private INTERNAL_SERVER_ERROR: number = 500;

  // Events
  public VbaAsteroidLogin: EventEmitter<any>;
  public VbaAsteroidLogout: EventEmitter<any>;
  public VbaAsteroidLoginError: EventEmitter<any>;
  public VbaAsteroidConnected: EventEmitter<any>;
  public VbaAsteroidDisconnected: EventEmitter<any>;
  public VbaAsteroidReconnected: EventEmitter<any>;

  constructor(
    public vbaUtils: VbaUtils,
    @Inject('VbaConfig')
    public vbaConfig: VbaConfig
  ) {
    this.VbaAsteroidLogin = new EventEmitter();
    this.VbaAsteroidLogout = new EventEmitter();
    this.VbaAsteroidConnected = new EventEmitter();
    this.VbaAsteroidDisconnected = new EventEmitter();
    this.VbaAsteroidReconnected = new EventEmitter();
    this.VbaAsteroidLoginError = new EventEmitter();
  }

  public loginPromise(loginRequired: boolean) {
    return new Promise((resolve, reject) => {
      if (this.asteroid.userId || !loginRequired) {
        resolve();
      } else {
        this.VbaAsteroidLogin.subscribe(() => {
          resolve();
        });
      }

    });
  }

  public getExtraData(extra: any) {
    let asteroid = this.asteroid;
    let key;

    if (extra === true) {
      key = asteroid._host + '__' + asteroid._instanceId + '__login_token__';
    } else if (extra !== false) {
      key = extra;
    }

    return localStorage[key];
  };

  public get() {
    if (!this.asteroid) {
      this.asteroid = new VBAsteroid(this.vbaConfig._host, this.vbaConfig._ssl, this.vbaConfig);
      this.vbaUtils.log('asteroid', this.asteroid);

      this.asteroid.on('connected', () => {
        this.vbaUtils.log('connected');
        this.VbaAsteroidConnected.emit('virtualbeamsAsteroidConnected');
      });

      this.asteroid.on('disconnected', () => {
        this.vbaUtils.log('disconnected');
        this.VbaAsteroidDisconnected.emit('virtualbeamsAsteroidDisconnected');
      });

      this.asteroid.on('reconnected', () => {
        this.vbaUtils.log('reconnected');
        this.VbaAsteroidReconnected.emit('virtualbeamsAsteroidReconnected');
      });

      this.asteroid.on('loggedIn', (idUser) => {
        this.vbaUtils.log('login', idUser);
        this.VbaAsteroidLogin.emit(idUser);
      });

      this.asteroid.on('loggedOut', () => {
        this.vbaUtils.log('logout');
        if (this.vbaConfig._stopSubscriptionsOnLogout) {
          this.stopSubscriptions();
        }
        this.VbaAsteroidLogout.emit('virtualbeamsAsteroidLogout');
      });

      this.asteroid.on('loginError', (err) => {
        this.VbaAsteroidLoginError.emit(err);
      });

      this.listenForChanges();
    }

    return this.asteroid;
  }

  public login(config: IConfigLogin) {
    return new Promise((resolve, reject) => {
      let sendLogin = {
        password: config.password,
        email: undefined,
        username: undefined
      };

      let isEmail = this.isEmail(config.usernameOrEmail);

      if (isEmail) {
        sendLogin.email = config.usernameOrEmail;
      } else {
        sendLogin.username = config.usernameOrEmail;
      }

      let promise = this.asteroid.vbaLoginWithPassword(sendLogin);

      // this.listenForResults(this.vbaConfig._loginMethod, deferred);

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

  public logout() {
    return new Promise((resolve, reject) => {

      let promise = this.asteroid.logout();

      // this.listenForResults(this.vbaConfig._logoutMethod, deferred);

      promise.then(() => {
        this.vbaUtils.log(this.LOGOUT);
        resolve();
      }, (err) => {
        this.vbaUtils.error(err);
        reject(err);
      });

    });
  }

  public call(method: string, data: any = {}, config?: IConfigSuscribe): Promise<any> {
    return new Promise((resolve, reject) => {
      let extraData = !config ? this.vbaConfig._extraData : config.extraData;
      let loginRequired = !config ? this.vbaConfig._loginRequiredInCalls : !config.loginRequired ? this.vbaConfig._loginRequiredInCalls : config.loginRequired;

      if (extraData) {
        data.extra = this.getExtraData(extraData);
      }

      this.listenForResults(method, reject);

      this.loginPromise(loginRequired).then(() => {
        return this.asteroid.call(method, data);
      }).then((result) => {
        this.vbaUtils.log(method, result);
        resolve(result);
      }).catch((err) => {
        this.vbaUtils.error(method, err);
        reject(err);
      });

    });
  }

  public subscribe(config: IConfigSuscribe): EventEmitter<any> {
    let event = new EventEmitter();
    const subscribeName = config.nameSubscribe;
    let sendExtraData = this.vbaConfig._extraData || config.extraData;
    let loginRequired = !config.loginRequired ? this.vbaConfig._loginRequiredInSubscribes : config.loginRequired;
    config.params = config.params || {};

    if (sendExtraData) {
      config.params.extraData = this.getExtraData(sendExtraData);
    }

    this.loginPromise(loginRequired).then(() => {
      let subscription = this.asteroid.subscribe(config.nameSubscribe, config.params);
      let observable: ISuscriptionObservable = {
        suscription: subscription,
        event: event,
        config: config
      };

      this.subscribeObservables[subscribeName] = observable;

        subscription.on('ready', () => {
          console.log(this.asteroid);
        });

      subscription.on('error', (err) => {
        this.vbaUtils.error(subscribeName, err);
        delete this.subscribeObservables[subscribeName];
      });

      return subscription.ready;
    }).then(() => {
      this.vbaUtils.log(subscribeName, this.SUBSCRIBE);
    });

    return event;
  }

  public getSubscription(config: any) {
    let subscriptionsObjects = this.asteroid.subscriptions;
    let subscribeNames = Object.keys(subscriptionsObjects);

    return subscribeNames.find((name: any) => {
      let subscription = subscriptionsObjects[name];
      if (subscription._name === config.nameSubscribe) {
        return true;
      }
    });
  }

  public stopOnlySubscription(nameSubscription: string) {
    let subscribeObservable = this.subscribeObservables[nameSubscription];
    if (subscribeObservable) {
      let idSubscription = subscribeObservable.suscription.id;
      this.asteroid.unsubscribe(idSubscription);
      this.subscribeObservables[nameSubscription].unsubscribe();
      delete this.subscribeObservables[nameSubscription];
      this.vbaUtils.log(nameSubscription, this.STOPPED);
    }
  }

  public stopSubscriptions() {
    let keys = Object.keys(this.subscribeObservables);
    for (let key of keys) {
      this.stopOnlySubscription(key);
    }
  }

  private isEmail(string: string) {
    return string.indexOf('@') !== -1;
  }

  private notify(subscribeName: string, config: any, eventEmmiter: EventEmitter<any> , result: Array<any>) {
    if (typeof config.filter === 'function') {
      result = config.filter(result);
    }
    if (config.reverse) {
      result.reverse();
    }
    this.vbaUtils.log(subscribeName, this.CHANGED, result);
    eventEmmiter.emit(result);
  }

  private notifyEvents(subscribeName: string, config: any, eventEmmiter: EventEmitter<any>, document: any, event: string, _id: string) {
    this.vbaUtils.log(subscribeName, event, document);
    let result = {
      values: document,
      event: event,
      _id: _id
    };
    eventEmmiter.emit(result);
  }

  private listenForChanges() {
    this.asteroid.on('collections:change', (event, collection, _id) => {
      let subscribeObservable: ISuscriptionObservable = this.subscribeObservables[collection];

      if (subscribeObservable) {
        let collectionMap: Map<any, any> = this.asteroid.collections.get(collection);
        if (!subscribeObservable.config.notifyEvents) {
          let data = collectionMap.toJS();
          let values = ObjectValues(data);
          console.log(values);
          this.notify(collection, subscribeObservable.config, subscribeObservable.event, values);
        } else {
          let value;
          if (event !== this.REMOVED) {
            value = collectionMap.get(_id).toJS();
          }
          this.notifyEvents(collection, subscribeObservable.config, subscribeObservable.event, value, event, _id);
        }
      }
    });
  }

  private listenForResults(methodName: string, reject: any) {
    this.asteroid.ddp.on('result', (result) => {
      if (result.error && result.error.error === this.INTERNAL_SERVER_ERROR) {
        this.vbaUtils.error(methodName, result.error);
        reject(result.error);
      }
    });
  }

}
