import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
 private tokens= inject(TokenService);
claims = computed(() => this.tokens.getClaims());


}
