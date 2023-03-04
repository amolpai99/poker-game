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
  winners: string[];
  winningHand: string;

  gameDetails: any;

  tempString: string;

  constructor(
    private cardsService: CardsService) {

  }

  ngOnInit() {
    // this.cardsService.generateCards(this.numPlayers)

    // this.playerNames = [];
    // for(let i=1; i<=this.numPlayers; i++) {
    //   this.playerNames.push("player"+i.toString())
    // }

    // this.cardsService.getWinner().subscribe((winner) => {
    //   this.winners = winner["winners"]
    //   this.winningHand = winner["winning_hand"]
    // })

    this.cardsService.getGameDetails().subscribe((gameDetails) => {
      this.gameDetails = gameDetails
      this.tempString = JSON.stringify(gameDetails)
    })

  }

  generate() {
    this.cardsService.generateCards(this.numPlayers)
    
    this.cardsService.getWinner().subscribe((winner) => {
      this.winners = winner["winners"]
      this.winningHand = winner["winning_hand"]
    })

  }

}
