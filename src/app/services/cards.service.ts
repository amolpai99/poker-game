import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  selectedCards: number[];

  tableCards: number[];
  handCards = {};

  constructor() {
    this.selectedCards = [];
    this.tableCards = [];
  }

  getCards(): number[] {
    return this.selectedCards
  }

  getTableCards(): number[] {
    return this.tableCards
  }

  getAllHandCards(): {} {
    return this.handCards
  }

  setCard(cardNum: number, hand: string) {
    if(hand == "table") {
      this.tableCards.push(cardNum)
    }
    else {
      if(this.handCards[hand]) {
        this.handCards[hand].push(cardNum)
      }
      else {
        this.handCards[hand] = [cardNum]
      }
    }
    this.selectedCards.push(cardNum);
    this.selectedCards.sort((a, b) => {return a-b});
  }
}
