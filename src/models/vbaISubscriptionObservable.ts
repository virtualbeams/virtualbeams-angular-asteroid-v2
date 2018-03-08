import { EventEmitter } from '@angular/core';

/**
 * subscription observable
 */
export interface ISubscriptionObservable {
  /**
   * configuration of subscription
   */
  config: IConfigSubscribe;
  /**
   * name of subscription
   */
  subscription: any;
  /**
   * event emmiter of subscription
   */
  event: EventEmitter<any>;
}

/**
 * configuration of subscription
 */
export interface IConfigSubscribe {
  /**
   * name of subscription
   */
  nameSubscribe: string;
  /**
   * name of collection
   */
  nameCollection?: string;
  /**
   * params of subscription
   */
  params?: any;
  /**
   * set custom data
   */
  extraData?: any;
  /**
   * set if login is required
   */
  loginRequired?: boolean;
  /**
   * filter result data
   */
  filter?: () => any;
  /**
   * reverse result
   */
  reverse?: boolean;
  /**
   * notify changes in events mode
   */
  notifyEvents?: boolean;
}

/**
 * config to call method
 */
export interface IConfigCall {
  /**
   * set if login is required to call
   */
  loginRequired?: boolean;
  /**
   * put additional data
   */
  extraData?: any;
}

/**
 * config login
 */
export interface IConfigLogin {
  /**
   * set username or email to login
   */
  usernameOrEmail: string;
  /**
   * set password
   */
  password: string;
}
