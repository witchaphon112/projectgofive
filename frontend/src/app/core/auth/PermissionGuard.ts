import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { PermissionService } from '../services/permission.service';

export const PermissionGuard: CanActivateFn = (route) => {
  const permissionService = inject(PermissionService);

  const permissionId = route.data?.['permissionId'] as string | undefined;
  if (!permissionId || permissionService.canRead(permissionId)) {
    return true;
  }

  console.warn(
    '[PermissionGuard] Missing read permission for',
    permissionId,
    '— allowing navigation but actions will be disabled.'
  );
  return true;
};

