import { Component } from '@angular/core';

function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent {
  numCards = 5;

  selectedCards: any[];
  cardSuits = ["spade", "heart", "diamonds", "clubs"]

  constructor() {

  }

  ngOnInit() {
    let cardNumbers: number[] = [];
    this.selectedCards = [];

    for(let i=0; i<this.numCards; i++) {
      let cardNumber = randomIntFromInterval(1, 52);
      while(cardNumbers.includes(cardNumber) == true) {
        cardNumber = randomIntFromInterval(1, 52);
      }
      cardNumbers.push(cardNumber);

      let cardSuit: string = this.cardSuits[Math.floor(cardNumber / 13)];
      let cardNum = String((cardNumber - 1) % 13 + 1);

      console.log(cardNum)
      console.log(cardSuit)
      this.selectedCards.push({suit: cardSuit, card: cardNum})
    }

  
  }
}
