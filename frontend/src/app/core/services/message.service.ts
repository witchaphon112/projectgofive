import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ChatContact, MessageItem } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService implements OnDestroy {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://localhost:5001/api/Messages';

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingSub: Subscription | null = null;

  getContacts(myId: string): Observable<ChatContact[]> {
    return this.http.get<ChatContact[]>(`${this.apiUrl}/contacts/${myId}`);
  }

  getHistory(myId: string, contactId: string): Observable<MessageItem[]> {
    return this.http.get<MessageItem[]>(`${this.apiUrl}/history/${myId}/${contactId}`);
  }

  sendMessage(myId: string, receiverId: string, content: string): Observable<MessageItem> {
    return this.http.post<MessageItem>(`${this.apiUrl}/send/${myId}`, { 
      receiverId: receiverId, content: content 
    });
  }

  startGlobalPolling(myId: string) {
    if (this.pollingSub) return;

    this.pollingSub = timer(0, 4000).pipe(
      switchMap(() => this.getContacts(myId))
    ).subscribe({
      next: (contacts) => {
        const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);
        this.unreadCountSubject.next(totalUnread);
      },
      error: (err) => console.error('Global Polling Error', err)
    });
  }

  stopGlobalPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
    this.unreadCountSubject.next(0);
  }

  refreshNow(myId: string) {
    this.getContacts(myId).subscribe(contacts => {
      const totalUnread = contacts.reduce((sum, c) => sum + c.unreadCount, 0);
      this.unreadCountSubject.next(totalUnread);
    });
  }

  ngOnDestroy() {
    this.stopGlobalPolling();
  }
}