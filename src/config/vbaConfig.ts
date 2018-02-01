import { InjectionToken } from '@angular/core';

/**
 * config utils to asteroid
 */
export interface VbaConfigConst {
  /**
   * prefix to logs
   */
  prefix?: string;
  /**
   * host url
   */
  host: string;
  /**
   * log events
   */
  log?: boolean;
  /**
   * log errors
   */
  logError?: boolean;
  /**
   * set if login is required to call methods
   */
  loginRequiredInCalls?: boolean;
  /**
   * set if login is required to subscriptions
   */
  loginRequiredInSubscribes?: boolean;
  /**
   * set ssl
   */
  ssl?: boolean;
  /**
   * put extra data
   */
  extraData?: boolean;
  /**
   * stop subscriptions on logout
   */
  stopSubscriptionsOnLogout?: boolean;
  /**
   * set login method
   */
  loginMethod?: string;
  /**
   * set resume method
   */
  resumeMethod?: string;
  /**
   * set logout method
   */
  logoutMethod?: string;
  /**
   * set run data
   */
  runData?: Array<any>;
}
