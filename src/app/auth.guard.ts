import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

export const AuthGuard = createAuthGuard(
  async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    authData: AuthGuardData
  ) => {
    const keycloak = inject(Keycloak);
    const router = inject(Router);

    const { authenticated, grantedRoles } = authData;
    const isAdmin = grantedRoles.realmRoles.includes('admin');
    const isSuperAdmin = grantedRoles.realmRoles.includes('superadmin');

    if (!authenticated) {
      keycloak.logout({
        redirectUri: window.location.origin + "/login",
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

export const DeAuthGuard = createAuthGuard(
  async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    authData: AuthGuardData
  ) => {
    const router = inject(Router);

    const { authenticated } = authData;

    if (authenticated) {
      router.navigate(["form"])
    }

    return true;
  }
);
