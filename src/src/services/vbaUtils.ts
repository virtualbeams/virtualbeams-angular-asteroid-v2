import { Inject } from '@angular/core';
import { VbaConfig } from '../config/vbaConfig';
export class VbaUtils {

  /* @ngInject */
  constructor(
    @Inject('VbaConfig')
    public vbaConfig: VbaConfig
  ) {
  }

  public log(...arg: Array<any>) {
    if (this.vbaConfig._log) {
      console.log(this.vbaConfig._logPrefix, ...arg);
    }
  }

  public error(...arg: Array<any>) {
    if (this.vbaConfig._logError) {
      console.error(this.vbaConfig._logPrefix, ...arg);
    }
  }

}
