import { Routes } from '@angular/router';
import { Component } from '@angular/core';

import { MainLayoutComponent } from './core/layout/main-layout/main-layout';
import { ContentWrapper } from './features/content-wrapper/content-wrapper';

import { DashboardComponent } from './features/dashboard/dashboard';
import { Objectives } from './features/objectives/objectives';
import { Documents } from './features/documents/documents';
import { Photos } from './features/photos/photos';
import { Hierachy } from './features/hierachy/hierachy';
import { Message } from './features/message/message';
import { Help } from './features/help/help';
import { Setting } from './features/setting/setting';
import { Login } from './features/auth/login/login';

import { AuthGuard } from './core/auth/AuthGuard';
import { PermissionGuard } from './core/auth/PermissionGuard';
import { FEATURE_PERMISSION_MAP } from './core/config/feature-permissions';

export const routes: Routes = [
    { 
        path: 'login', 
        component: Login 
    },

    { 
        path: '', 
        redirectTo: 'login', 
        pathMatch: 'full' 
    },

    {
        path: "",
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children:[
            { 
                path: '',
                component: ContentWrapper,
                children: [
                    { 
                        path: 'dashboard', 
                        component: DashboardComponent,
                        canActivate: [PermissionGuard],
                        data: { permissionId: FEATURE_PERMISSION_MAP.dashboard }
                    },
                    { 
                        path: 'objectives', 
                        component: Objectives,
                        canActivate: [PermissionGuard],
                        data: { permissionId: FEATURE_PERMISSION_MAP.objectives }
                    },
                    { 
                        path: 'documents', 
                        component: Documents,
                        canActivate: [PermissionGuard],
                        data: { permissionId: FEATURE_PERMISSION_MAP.documents }
                    },
                    { 
                        path: 'photos', 
                        component: Photos,
                        canActivate: [PermissionGuard],
                        data: { permissionId: FEATURE_PERMISSION_MAP.photos }
                    },
                    { 
                        path: 'hierachy', 
                        component: Hierachy,
                        canActivate: [PermissionGuard],
                        data: { permissionId: FEATURE_PERMISSION_MAP.hierachy }
                    },
                    { 
                        path: 'message', 
                        component: Message,
                        canActivate: [PermissionGuard],
                        data: { permissionId: FEATURE_PERMISSION_MAP.message }
                    },
                    { 
                        path: 'help', 
                        component: Help,
                        canActivate: [PermissionGuard],
                        data: { permissionId: FEATURE_PERMISSION_MAP.help }
                    },
                    { 
                        path: 'setting', 
                        component: Setting,
                        canActivate: [PermissionGuard],
                        data: { permissionId: FEATURE_PERMISSION_MAP.setting }
                    }
                ]
            }
        ]
    },

    { path: '**', redirectTo: 'login' }
];