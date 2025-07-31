import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

export const AuthGuard = createAuthGuard(
  async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    authData: AuthGuardData
  ) => {
    const keycloak = inject(Keycloak);
    const { authenticated, grantedRoles } = authData;
    const isAdmin = grantedRoles.realmRoles.includes('admin');
    const isSuperAdmin = grantedRoles.realmRoles.includes('superadmin');

    if (!authenticated) {
      keycloak.login({
        redirectUri: window.location.origin + state.url,
      });
    }

    route.data = {
      ...route.data,
      isAdmin,
      isSuperAdmin,
    };

    return true;
  }
);
