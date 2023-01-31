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

  selectedCards: any[];

  constructor(private cardsService: CardsService) {

  }

  ngOnInit() {
    this.selectedCards = [];
    let num = parseInt(this.numCards)
    let cardNumber: number;

    let cardNumbers = this.cardsService.getCards()

    for(let i=0; i<num; i++) {
      cardNumber = randomIntFromInterval(0, 51);

      while(cardNumbers.includes(cardNumber) == true) {
        cardNumber = randomIntFromInterval(1, 52);
      }

      this.cardsService.setCard(cardNumber);
      this.selectedCards.push({"card": cardNumber.toString(), "open": true})
    }

  
  }
}
