import { Component, Inject } from '@angular/core';
import { CardsService } from '../services/cards.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  numPlayers = 4;

  playerNames: string[];

  constructor(
    private cardsService: CardsService) {

  }

  ngOnInit() {
    this.cardsService.generateCards(this.numPlayers)

    this.playerNames = [];
    for(let i=1; i<=this.numPlayers; i++) {
      this.playerNames.push("player"+i.toString())
    }

  }

  generate() {
    this.cardsService.generateCards(this.numPlayers)
  }

}
