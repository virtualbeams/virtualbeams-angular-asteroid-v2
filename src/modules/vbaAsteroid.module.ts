import { NgModule, ModuleWithProviders } from '@angular/core';

import { VbaService } from '../services/vbaService';
import { VbaUtils } from '../services/vbaUtils';
import { VbaConfigConst } from '../config/vbaConfig';


@NgModule({
    declarations: [
        // Pipes.
        // Directives.
        // Components.
    ],
    exports: [
        // Pipes.
        // Directives.
        // Components.
    ]
})
export class VbaAsteroidModule {

    /**
     * Use in AppModule: new instance of VbaService.
     * @param config {VbaConfigConst}
     */
    public static forRoot(config: VbaConfigConst): ModuleWithProviders {
        return {
            ngModule: VbaAsteroidModule,
            providers: [
                VbaService,
                { provide: 'vbaConfigConst', useValue: config },
                VbaUtils
            ]
        };
    }

}
