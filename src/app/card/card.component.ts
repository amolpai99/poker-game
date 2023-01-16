import { Component, Input } from '@angular/core';
import { CARDS } from '../shared/cards';
import { Card } from '../shared/card_templates';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input('card') cardId: string;
  @Input('suit') cardSuit: string;
  cardSuitSymbol: string;
  cardNumber: string;
  cardImage: string;
  cardClasses = CARDS;
  cardSelected: Card;
  valueCard: boolean;

  isFrontCard: boolean;

  faceCards: Object = {
    "J": {
      'spade': '../../assets/images/jack_spade.jpg',
      'heart': '../../assets/images/jack_hearts.jpg',
      'diamonds': '../../assets/images/jack_diamonds.jpg',
      'clubs': '../../assets/images/jack_clubs.jpg'
    },
    "Q": {
      'spade': '../../assets/images/queen_spade.jpg',
      'heart': '../../assets/images/queen_hearts.jpg',
      'diamonds': '../../assets/images/queen_diamonds.jpg',
      'clubs': '../../assets/images/queen_clubs.jpg'
    },
    "K": {
      'spade': '../../assets/images/king_spade.jpg',
      'heart': '../../assets/images/king_hearts.jpg',
      'diamonds': '../../assets/images/king_diamonds.jpg',
      'clubs': '../../assets/images/king_clubs.jpg'
    }
  };

  constructor() {

  }

  ngOnInit() {
    this.cardSelected = this.cardClasses.find((card) => this.cardId == card.id)!;
    this.cardNumber = this.cardSelected.value;

    this.isFrontCard = false;

    let number = parseInt(this.cardId);

    this.valueCard = true
    if(number >= 11) {
      this.valueCard = false
      let faceCard = this.faceCards[this.cardNumber as keyof object]
      this.cardImage = faceCard[this.cardSuit as keyof Object]
    }

    switch (this.cardSuit) {
      case 'heart':
        this.cardSuitSymbol = '♥';
        break;
      case 'spade':
        this.cardSuitSymbol = '♠';
        break;
      case 'clubs':
        this.cardSuitSymbol = '♣';
        break;
      case 'diamonds':
        this.cardSuitSymbol = '♦';
        break;
    }
  }

  toggleFrontBack() {
    this.isFrontCard = !this.isFrontCard;
  }

}
