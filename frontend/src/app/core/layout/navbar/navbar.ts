import { Component, OnInit, OnDestroy, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router'; 
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MessageService } from '../../services/message.service';
import { ChatContact } from '../../models/message.model';
import { PermissionService } from '../../services/permission.service';
import { Permission } from '../../models/permission.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ CommonModule, MatIconModule, RouterModule, DatePipe ],
  templateUrl: './navbar.html',
})
export class NavbarComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private messageService = inject(MessageService);
  private elementRef = inject(ElementRef);
  private permissionService = inject(PermissionService);
  
  currentUser: any = null;
  currentPermissions: Permission[] = [];
  
  isProfileOpen = false;
  isNotificationOpen = false;

  unreadCount: number = 0;
  unreadContacts: ChatContact[] = [];
  private pollingSub: Subscription | null = null;

  ngOnInit(): void {
    this.loadUser();

    if (this.currentUser && this.currentUser.id) {
      this.startNotificationSystem();
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  loadUser() {
    const userStr = localStorage.getItem('user'); 
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.permissionService.refreshFromStorage();
        this.currentPermissions = this.permissionService['currentPermissions'] ?? [];
      } catch (e) { 
        console.error(e); 
      }
    }
    
    if (!this.currentUser?.id) {
    }
  }

  startNotificationSystem() {
    this.pollingSub = timer(0, 5000).pipe(
      switchMap(() => this.messageService.getContacts(this.currentUser.id))
    ).subscribe({
      next: (contacts) => {
        this.unreadContacts = contacts.filter(c => c.unreadCount > 0);
        
        this.unreadCount = this.unreadContacts.reduce((sum, c) => sum + c.unreadCount, 0);
      },
      error: (err) => console.error('Notification Polling Error:', err)
    });
  }


  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
    this.isNotificationOpen = false;
  }

  toggleNotification() {
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isProfileOpen = false; 
  }

  openChat(contactId: string) {
    this.isNotificationOpen = false;
    
    if (contactId) {
      this.router.navigate(['/message'], { queryParams: { chatWith: contactId } }); 
    } else {
      this.router.navigate(['/message']);
    }
  }

  goToSettings() {
    this.isProfileOpen = false;
    this.isNotificationOpen = false;
    localStorage.setItem('selectedUserPermissions', JSON.stringify(this.currentPermissions));
    this.router.navigate(['/setting']);
  }
  
  logout() {
    if (this.pollingSub) this.pollingSub.unsubscribe();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileOpen = false;
      this.isNotificationOpen = false;
    }
  }
}