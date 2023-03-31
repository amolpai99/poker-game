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
  @Input('player_type') playerType: string;

  cardClasses = CARDS;

  cardSuit: any;
  cardImage: string;

  cardSelected: Card;
  isFaceCard: boolean;
  isFrontCard: boolean;

  cardSizes = {
    "table": {
      "width": "100px",
      "height": "140px",
      "font": "12px 'Trebuchet MS'"
    },
    "primary": {
      "width": "100px",
      "height": "140px",
      "font": "12px 'Trebuchet MS'"
    },
    "secondary": {
      "width": "75px",
      "height": "105px",
      "font": "9px 'Trebuchet MS'"
    }
  }

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

    console.log("Player type: ", this.playerType, "Card Number: ", this.cardNumber)

    this.cardSuit = this.cardSuits[Math.floor((number - 1) / 13)];
    cardId = String(number % 13 + 1);

    this.cardSelected = this.cardClasses.find((card) => cardId == card.id)!;
    this.isFrontCard = (this.openCard === "true");

    this.isFaceCard = false
    if(number % 13 >= 10) {
      this.isFaceCard = true
      this.cardImage = `../../assets/images/${this.cardSelected.value}_${this.cardSuit["key"]}.jpg`
    }

    let cardKey = "card_"+this.cardNumber
    console.log("Card key: ", cardKey)
    let collection = document.getElementById(cardKey) as HTMLElement
    console.log("Collection: ", collection)
    let cardSizeClasses = this.cardSizes[this.playerType]
    // for(let i=0; i<collection.length; i++) {
      
    // }
    if(collection != null) {
      console.log("Setting width and height for card number:", this.cardNumber)
      for(var cardClass in cardSizeClasses) {
        collection.style.setProperty(cardClass, cardSizeClasses[cardClass])
      }
    }
    
  }

  getCardClass() {
    return this.playerType+"_card"
  }

  toggleFrontBack() {
    this.isFrontCard = !this.isFrontCard;
  }

}
