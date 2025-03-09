import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideNgxStripe} from 'ngx-stripe'

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { LoggingInterceptor } from './interceptors/auth.interceptor';



export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),provideHttpClient(withFetch(),withInterceptorsFromDi()),
    {provide:HTTP_INTERCEPTORS,useClass:LoggingInterceptor,multi:true},
    provideNgxStripe('pk_test_51Nfg2KCKZ5C2Qjb0yEsWLfDGwmCVIJQ78eEBKAcWEJTUlidm0cN8GQBoCy59UnDzV92EuDHkzKt6yyDmL44tBUbc00TApGl40S')
  ]
};
