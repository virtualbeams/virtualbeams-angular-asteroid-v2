import { Inject, Injectable } from '@angular/core';
import { VbaConfigConst } from '../config/vbaConfig';

const DEFAULT_PREFIX = 'vba->';

@Injectable()
export class VbaUtils {

  /**
  * Init the VbaUtils.
  * @classdesc Utils to VbaAsteroid
  * @param vbaConfigConst {VbaConfigConst} config
  */
  constructor(
    @Inject('vbaConfigConst')
    private vbaConfigConst: VbaConfigConst
  ) {
  }

  /**
  * log in console with custom prefix if this option is enabled.
  * @member VbaUtils#log
  * @param args {Array<any>} log params
  */
  public log(...args: Array<any>): void {
    if (this.vbaConfigConst.log) {
      console.log(this.vbaConfigConst.prefix || DEFAULT_PREFIX, ...args);
    }
  }

  /**
  * log errors in console with custom prefix if this option is enabled.
  * @member VbaUtils#log
  * @param args {Array<any>} log params
  */
  public error(...args: Array<any>): void {
    if (this.vbaConfigConst.logError) {
      console.error(this.vbaConfigConst.prefix || DEFAULT_PREFIX, ...args);
    }
  }

}
