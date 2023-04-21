import { Component } from '@angular/core';
import { ClientService } from '../services/client.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {

  // Game specific data
  gameId: string;

  // Winner specific data
  winners: string[];
  winningHand: string;

  // Player specific data
  primaryPlayer: string;
  players: any = [];

  constructor(
    private client: ClientService,
    private gameService: GameService) {

  }

  ngOnInit() {
    this.gameId = this.gameService.gameId;
    this.primaryPlayer = this.gameService.playerName;
    let players = this.gameService.players;

    for(let x in players) {
      if(players[x] != this.primaryPlayer) {
        this.players.push(players[x])
      }
    }

    this.gameService.onNewPlayerJoined().subscribe({
      next: (playerName) => {
        if(playerName != this.primaryPlayer) {
          this.players.push(playerName)
        }
      },
      error: (err) => {
        console.log("Error encountered:", err)
      }
    })


    this.client.generateCards(this.gameId)
  }

  generate() {
    this.client.generateCards(this.gameId)
    
    this.client.getWinner().subscribe((winner) => {
      this.winners = winner["winners"]
      this.winningHand = winner["winning_hand"]
    })

  }

}
