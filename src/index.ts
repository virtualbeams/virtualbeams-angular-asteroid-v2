import { NgModule, ModuleWithProviders } from '@angular/core';
import { VbaConfig } from './src/config/vbaConfig';
import { VbaService } from './src/services/vbaService';
import { VbaUtils } from './src/services/vbaUtils';


export * from './src/config/vbaConfig';
export * from './src/services/vbaService';

@NgModule()
export class VbaAsteroidModule {

  /**
   * Use this method in
   * @param { VbaConfig } config
   */
  static forRoot(config: VbaConfig): ModuleWithProviders {
    return {
      ngModule: VbaAsteroidModule,
      providers: [
        VbaService,
        { provide: 'VbaConfig', useValue: config },
        VbaUtils
      ]
    };
  }

}
