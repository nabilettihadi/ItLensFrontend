import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white shadow mb-4">
      <nav class="container mx-auto px-4 py-3">
        <ul class="flex gap-4">
          <li>
            <a routerLink="/" 
               routerLinkActive="text-blue-600" 
               [routerLinkActiveOptions]="{exact: true}">
              Accueil
            </a>
          </li>
          <li>
            <a routerLink="/surveys" 
               routerLinkActive="text-blue-600">
              Sondages
            </a>
          </li>
        </ul>
      </nav>
    </header>
  `
})
export class HeaderComponent {}
