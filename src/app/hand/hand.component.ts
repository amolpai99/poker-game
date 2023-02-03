import { Component, Input } from '@angular/core';
import { CardsService } from '../services/cards.service';

function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent {
  @Input("num_cards") numCards: string = "5";
  @Input("open_hand") openHand: string = "false";
  @Input("hand_type") hand: string;

  selectedCards: any[];

  constructor(private cardsService: CardsService) {

  }

  ngOnInit() {
    this.selectedCards = [];
    let num = parseInt(this.numCards)
    let cardNumber: number;

    let cardNumbers = this.cardsService.getCards()

    // Select "num" cards from deck of cards, such that none is repeated
    for(let i=0; i<num; i++) {
      cardNumber = randomIntFromInterval(1, 52);

      while(cardNumbers.includes(cardNumber) == true) {
        cardNumber = randomIntFromInterval(1, 52);
      }

      // Set the card in service so that it is globally accessible
      this.cardsService.setCard(cardNumber, this.hand);
      this.selectedCards.push({"card": cardNumber.toString(), "open": true})
    }

  
  }
}
