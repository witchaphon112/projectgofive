import { Component, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription, timer } from 'rxjs';

import { NewChatDialogComponent } from '../../shared/components/add-chat/add-chat';
import { ChatContact, MessageItem } from '../../core/models/message.model';
import { MessageService } from '../../core/services/message.service';
import { PermissionService } from '../../core/services/permission.service';
import { FEATURE_PERMISSION_MAP } from '../../core/config/feature-permissions';
import { SearchInput } from '../../shared/components/search-input/search-input';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe, MatDialogModule, SearchInput], 
  templateUrl: './message.html',
})
export class Message implements OnInit, OnDestroy {

  private messageService = inject(MessageService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private permissionService = inject(PermissionService);

  myId = ''; 

  chatContacts = signal<ChatContact[]>([]);
  selectedChatId = signal<string | null>(null);
  messages = signal<MessageItem[]>([]);
  canWrite = false;
  searchQuery = signal<string>('');

  private pollingSub: Subscription | null = null;

  // ✨ เพิ่ม: Computed signal สำหรับกรอง contacts
  filteredChatContacts = computed(() => {
    const contacts = this.chatContacts();
    const search = this.searchQuery().toLowerCase().trim();
    
    if (!search) {
      return contacts;
    }

    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(search) ||
      contact.lastMessage.toLowerCase().includes(search)
    );
  });

  private permissionsUpdateHandler = () => {
    this.permissionService.refreshFromStorage();
    this.canWrite = this.permissionService.canWrite(FEATURE_PERMISSION_MAP.message);
  };

  ngOnInit(): void {
    this.permissionService.refreshFromStorage();
    this.canWrite = this.permissionService.canWrite(FEATURE_PERMISSION_MAP.message);
    this.loadCurrentUser();
    
    window.addEventListener('permissionsUpdated', this.permissionsUpdateHandler);
    
    if (this.myId) {
      this.loadContacts();
      
      this.startLocalPolling();

      this.route.queryParams.subscribe(params => {
        const chatWithId = params['chatWith'];
        if (chatWithId) {
           setTimeout(() => {
             this.selectChat(chatWithId);
           }, 500); 
        }
      });

    } else {
      console.error('❌ ยังไม่สามารถหา ID ได้ กรุณาตรวจสอบ Token');
    }
  }

  ngOnDestroy(): void {
    this.stopLocalPolling();
    window.removeEventListener('permissionsUpdated', this.permissionsUpdateHandler);
  }

  startLocalPolling() {
    this.stopLocalPolling();

    this.pollingSub = timer(0, 3000).subscribe(() => {
      this.refreshContactsList();

      if (this.selectedChatId()) {
        this.refreshCurrentChatMessages();
      }
    });
  }

  stopLocalPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
  }

  refreshContactsList() {
    this.messageService.getContacts(this.myId).subscribe({
      next: (newData) => {
        if (this.selectedChatId()) {
             newData = newData.map(c => c.id === this.selectedChatId() ? { ...c, unreadCount: 0 } : c);
        }
        this.chatContacts.set(newData);
      },
      error: (err) => console.error('Polling contacts error', err)
    });
  }

  refreshCurrentChatMessages() {
    const contactId = this.selectedChatId();
    if (!contactId) return;

    this.messageService.getHistory(this.myId, contactId).subscribe({
      next: (newMessages) => {
        if (newMessages.length !== this.messages().length) {
          this.messages.set(newMessages);
        }
      }
    });
  }

  loadCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.myId = user.id || user.userId || user.Id || user.UserId || '';
      } catch (e) { }
    }

    if (!this.myId) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = this.parseJwt(token);
        this.myId = decoded['nameid'] || decoded['sub'] || decoded['Id'] || '';
      }
    }
  }

  private parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) { return {}; }
  }

  loadContacts() {
    this.messageService.getContacts(this.myId).subscribe({
      next: (data) => this.chatContacts.set(data),
      error: (err) => console.error('Error loading contacts:', err)
    });
  }

  openNewChat() {
    const dialogRef = this.dialog.open(NewChatDialogComponent, {
      width: '400px',
      panelClass: 'rounded-dialog'
    });

    dialogRef.afterClosed().subscribe(selectedUser => {
      if (selectedUser) {
        const existingChat = this.chatContacts().find(c => c.id === selectedUser.id);
        if (existingChat) {
          this.selectChat(existingChat.id);
        } else {
          const newContact: ChatContact = {
            id: selectedUser.id,
            name: `${selectedUser.firstName} ${selectedUser.lastName}`,
            avatarUrl: `https://ui-avatars.com/api/?name=${selectedUser.firstName}+${selectedUser.lastName}&background=random`,
            lastMessage: 'Start a new conversation',
            lastActive: new Date().toISOString(),
            unreadCount: 0
          };
          this.chatContacts.update(list => [newContact, ...list]);
          this.selectChat(newContact.id);
        }
      }
    });
  }

  selectChat(contactId: string): void {
    this.selectedChatId.set(contactId);

    this.chatContacts.update(contacts => 
        contacts.map(c => c.id === contactId ? { ...c, unreadCount: 0 } : c)
    );
    
    this.messageService.refreshNow(this.myId);

    this.loadMessages(contactId);
  }

  loadMessages(contactId: string) {
    this.messageService.getHistory(this.myId, contactId).subscribe({
      next: (data) => {
        this.messages.set(data);
      },
      error: (err) => console.error('Error loading history:', err)
    });
  }

  getSelectedContact(): ChatContact | undefined {
    return this.chatContacts().find(c => c.id === this.selectedChatId());
  }

  sendMessage(inputElement: HTMLInputElement): void {
    const content = inputElement.value.trim();
    const receiverId = this.selectedChatId();

    if (!this.myId) {
        alert('Error: ไม่พบ ID ใน Token กรุณา Login ใหม่');
        return;
    }

    if (content && receiverId) {
      this.messageService.sendMessage(this.myId, receiverId, content).subscribe({
        next: (newMsg) => {
          this.messages.update(msgs => [...msgs, newMsg]);
          inputElement.value = ''; 
          
          this.chatContacts.update(contacts => {
            const updated = contacts.map(c => 
              c.id === receiverId 
              ? { ...c, lastMessage: content, lastActive: new Date().toISOString() } 
              : c
            );
            return updated.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
          });
        },
        error: (err) => {
            console.error('Send failed', err);
            alert(`ส่งข้อความไม่สำเร็จ: ${err.statusText || 'Unknown Error'}`);
        }
      });
    }
  }

  isMyMessage(senderId: string): boolean {
    return senderId === this.myId;
  }

  onSearchChats(term: string) {
    this.searchQuery.set(term);
    console.log('🔍 Searching chats for:', term);
  }
}