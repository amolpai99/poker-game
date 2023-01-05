import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  cardNumber = 5;
  cardSuit = '♣';

  cardArray = new Array(this.cardNumber);
  
}
