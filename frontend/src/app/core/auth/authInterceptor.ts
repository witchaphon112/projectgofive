import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) =>
{
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  let token: string | null = null;

  if (isBrowser)
  {
    token = localStorage.getItem('token');
  }

  if (token)
  {
    const clonedRequest = req.clone({
      setHeaders:
      {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(`[Interceptor] Attaching token to request: ${req.url}`);
    return next(clonedRequest);
  }

  return next(req);
};