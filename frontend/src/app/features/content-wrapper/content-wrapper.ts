import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../../core/layout/navbar/navbar';
@Component({
  selector: 'app-content-wrapper',
  imports: [
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './content-wrapper.html',
  styleUrl: './content-wrapper.css',
})
export class ContentWrapper {

}
