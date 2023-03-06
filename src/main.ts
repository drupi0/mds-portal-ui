/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { loader } from './environments/loader'
import { environment } from './environments/environment';

loader.then((env) => {
  environment.API_URL = env.API_URL;
  environment.AUTH_CLIENT = env.AUTH_CLIENT;
  environment.AUTH_REALM = env.AUTH_REALM;
  environment.AUTH_URL = env.AUTH_URL;

  platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

});

