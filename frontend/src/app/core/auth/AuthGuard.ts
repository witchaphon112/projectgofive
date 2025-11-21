import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  } else {
    console.warn('Access denied: No token found. Redirecting to login.');
    return router.createUrlTree(['/login']);
  }
};