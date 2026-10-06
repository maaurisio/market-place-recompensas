import { Component } from '@angular/core';
import { MarketplaceComponent } from './features/marketplace/marketplace.component';

@Component({
  selector: 'app-root',
  imports: [MarketplaceComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
