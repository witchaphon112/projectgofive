import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { FEATURE_PERMISSION_MAP } from '../../config/feature-permissions';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  permissionId: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  private readonly navigationItems = signal<SidebarItem[]>([
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', permissionId: FEATURE_PERMISSION_MAP.dashboard },
    { label: 'Objectives', icon: 'bar_chart', route: '/objectives', permissionId: FEATURE_PERMISSION_MAP.objectives },
    { label: 'Documents', icon: 'description', route: '/documents', permissionId: FEATURE_PERMISSION_MAP.documents },
    { label: 'Photos', icon: 'image', route: '/photos', permissionId: FEATURE_PERMISSION_MAP.photos },
    { label: 'Hierarch', icon: 'account_tree', route: '/hierachy', permissionId: FEATURE_PERMISSION_MAP.hierachy },
    { label: 'Message', icon: 'message', route: '/message', permissionId: FEATURE_PERMISSION_MAP.message },
    { label: 'Help', icon: 'help_outline', route: '/help', permissionId: FEATURE_PERMISSION_MAP.help },
    { label: 'Setting', icon: 'settings', route: '/setting', permissionId: FEATURE_PERMISSION_MAP.setting },
  ]);

  public readonly visibleItems = computed(() => this.navigationItems());
}