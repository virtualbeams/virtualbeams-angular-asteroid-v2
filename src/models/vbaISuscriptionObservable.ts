import { EventEmitter } from '@angular/core';

/**
 * subscriptiion observable
 */
export interface ISuscriptionObservable {
  /**
   * configuration of subscription
   */
  config: IConfigSuscribe;
  /**
   * name of subscription
   */
  suscription: any;
  /**
   * event emmiter of subscription
   */
  event: EventEmitter<any>;
}

/**
 * configuration of subscription
 */
export interface IConfigSuscribe {
  /**
   * name of subscribtion
   */
  nameSubscribe: string;
  /**
   * name of collection
   */
  nameCollection?: string;
  /**
   * params of subscribtion
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
   * put aditional data
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
