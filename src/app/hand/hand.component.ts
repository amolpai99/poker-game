import { Component, Inject, Input } from '@angular/core';
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
  @Input("player") playerName: string;

  cards: number[];

  constructor(
    private cardsService: CardsService) {
  }

  ngOnInit() {
    this.cardsService.getCards(this.playerName).subscribe({
      next: (cards) => {
        console.log("Player Name: ", this.playerName, "Cards:", cards)
        this.cards = cards
      }}
    );
  }

}
