import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SearchInput } from '../../shared/components/search-input/search-input';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, MatIconModule, SearchInput],
  templateUrl: './help.html',
})
export class Help {

  searchQuery = signal('');

  faqList = signal([
    { 
      question: 'Reset Password', 
      answer: 'Go to Settings > Security and click "Change Password".' 
    },
    { 
      question: 'Add New User', 
      answer: 'Go to Dashboard and click the "Add User" button.' 
    },
    { 
      question: 'Contact Support', 
      answer: 'Email us at admin@hrsystem.com for help.' 
    }
  ]);

  filteredFaqs = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.faqList().filter(item => 
      item.question.toLowerCase().includes(query) || 
      item.answer.toLowerCase().includes(query)
    );
  });

  onSearch(term: string) {
    this.searchQuery.set(term);
  }
}