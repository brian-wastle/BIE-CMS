import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const config: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideRouter(serverRoutes)
  ]
};

export const serverConfig = mergeApplicationConfig(appConfig, config);