import { Component } from '@angular/core';
import { ClientService } from '../services/client.service';
import { GameService } from '../services/game.service';

class PlayerDetails {
  name: string;
  id: string;
  class: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  // Game specific data
  gameId: string;

  // Winner specific data
  winners: string[];
  winningHand: string;

  // Player specific data
  playerId: string;
  playerName: string;

  playerIndex: number = 2;
  player: PlayerDetails;
  table: PlayerDetails;
  players: PlayerDetails[];

  isCreator: boolean;
  tableId: string = "player0";

  // Other variables
  showButton: boolean;

  constructor(
    private client: ClientService,
    private gameService: GameService) {
      this.showButton = true
      this.players = [];
  }

  ngOnInit() {
    this.gameId = this.gameService.gameId;
    this.playerId = this.gameService.playerId;
    this.playerName = this.gameService.playerName;
    let players = this.gameService.players;
    this.isCreator = this.gameService.isCreator;

    this.player = {
      name: this.playerName,
      id: this.playerId,
      class: "player1"
    }

    this.table = {
      name: "table",
      id: this.tableId,
      class: "table"
    }

    for(let id in players) {
      if(id != this.playerId && id != this.tableId) {
        this.players.push({
          name: players[id].name,
          id: id,
          class: "player"+this.playerIndex.toString(),
        })
        this.playerIndex++;
      }
    }

    this.client.onNewPlayerJoined().subscribe({
      next: (data) => {
        if(data["id"] != this.playerId) {
          this.players.push({
            name: data["name"],
            id: data["id"],
            class: "player"+this.playerIndex.toString(),
          })
          this.playerIndex++;
        }
      },
      error: (err) => {
        console.log("Error encountered:", err)
      }
    })

  }

  startGame() {
    this.showButton = false;
    if(this.isCreator) {
      this.client.generateCards(true)
    } 
  }

  openCard() {
    this.client.sendData()
  }

  checkPlayer(index: number): boolean {
    if(index == -1) {
      if(this.player.id != "") {
        return true
      }
      return false
    }

    if(this.players && this.players[index])
      return true
    return false
  }

}
