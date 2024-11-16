import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes, withHashLocation()), 
        provideServiceWorker(
            'ngsw-worker.js', 
            {
                enabled: !isDevMode(),
                registrationStrategy: 'registerWhenStable:30000'
            }
        )
    ]
};