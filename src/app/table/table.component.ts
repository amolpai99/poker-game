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
  playerId: string;
  playerName: string;
  players: {name: string, id: string}[];

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

    for(let id in players) {
      if(id != this.playerId && id != this.tableId) {
        this.players.push({
          name: players[id].name,
          id: id
        })
      }
    }

    this.client.onNewPlayerJoined().subscribe({
      next: (data) => {
        if(data["id"] != this.playerId) {
          this.players.push({
            name: data["name"],
            id: data["id"]
          })
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
    if(this.players && this.players[index])
      return true
    return false
  }

}
