import { Component, Input } from '@angular/core';
import { CARDS } from '../shared/cards';
import { Card } from '../shared/card_templates';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input('open') openCard: string;
  @Input('card_number') cardNumber: string;

  cardClasses = CARDS;

  cardSuit: any;
  cardImage: string;

  cardSelected: Card;
  isFaceCard: boolean;
  isFrontCard: boolean;

  cardSuits = [
    {
      "key": "clubs",
      "value": "♣"
    },
    {
      "key": "diamonds",
      "value": "♦"
    },
    {
      "key": "heart",
      "value": "♥"
    },
    {
      "key": "spade",
      "value": "♠"
    }
  ]

  constructor() {

  }

  ngOnInit() {
    let cardId: string, number: number;
    number = parseInt(this.cardNumber);

    this.cardSuit = this.cardSuits[Math.floor((number - 1) / 13)];
    cardId = String(number % 13 + 1);

    this.cardSelected = this.cardClasses.find((card) => cardId == card.id)!;
    this.isFrontCard = (this.openCard === "true");

    this.isFaceCard = false
    if(number % 13 >= 10) {
      this.isFaceCard = true
      this.cardImage = `../../assets/images/${this.cardSelected.value}_${this.cardSuit["key"]}.jpg`
    }
  }

  toggleFrontBack() {
    this.isFrontCard = !this.isFrontCard;
  }

}
