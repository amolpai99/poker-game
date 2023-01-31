import { Injectable } from '@angular/core';
import { CARDS } from '../shared/cards';
import { Card } from '../shared/card_templates';

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  selectedCards: number[];

  constructor() {
    this.selectedCards = [];
  }

  getCards(): number[] {
    return this.selectedCards
  }

  setCard(cardNum: number) {
    console.log("Cards: ", this.selectedCards)
    this.selectedCards.push(cardNum)
  }
}
