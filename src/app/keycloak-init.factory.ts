import { KeycloakService } from "keycloak-angular";
import { environment as env } from 'src/environments/environment';

export function initializeKeycloak(
  keycloak: KeycloakService
  ) {
    return () =>
      keycloak.init({
        config: {
          url: env.AUTH_URL,
          realm: env.AUTH_REALM,
          clientId: env.AUTH_CLIENT,
        },
        initOptions: {
            checkLoginIframe: false
        }
      });
}