import { Component } from '@angular/core';
import { ClientService } from '../services/client.service';
import { GameService, PlayerDetails } from '../services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  // Game specific data
  gameId: string;

  // Main player specific data
  mainPlayerId: string;
  isCreator: boolean;

  // Other players specific variables
  playerIds: string[];

  // Table specific data
  tableId: string;

  // Other variables
  showButton: boolean;
    
  constructor(
    private client: ClientService,
    private gameService: GameService) {
      this.showButton = true
  }

  ngOnInit() {
    this.gameId = this.gameService.gameId;
    this.mainPlayerId = this.gameService.mainPlayerId;
    this.tableId = this.gameService.tableId;
    this.playerIds = this.gameService.playerIds;

    console.log("GameComponent: ", "Main player id: ", this.mainPlayerId)
    console.log("GameComponent: ", "Table id: ", this.tableId)
    console.log("GameComponent: ", "All Players ids: ", this.playerIds)
  
    this.isCreator = this.gameService.isCreator;

    // When new player joins, add it to the "players" list
    this.client.onNewPlayerJoined().subscribe({
      next: (data) => {
        if(data["id"] != this.mainPlayerId && data["id"] != this.tableId) {
          this.gameService.addPlayer(data)
          this.playerIds = this.gameService.playerIds
        }
      },
      error: (err) => {
        console.log("Error encountered:", err)
      }
    })

    this.client.getNewState().subscribe((data) => {
      console.log("GameComponent: ", "Got New Data: ", data)
      if("game" in data) {
        let gameData = data["game"]
        delete data["game"]
      }
      this.gameService.setNewState(data);
    })


  }

  // Temporary action to start game
  startGame() {
    this.showButton = false;
    if(this.isCreator) {
      let data = {
        "game": {
          "state": "generate_cards",
          "data": {
            "new_round": true
          }
        }
      }
      this.client.sendCurrentState(data)
      
    } 
  }

  // Temporary action to open table card
  openCard() {
    let data = {
      "game": {
        "state": "open_cards",
      }
    }
    this.client.sendCurrentState(data)
  }

  // Check if player exists or not
  checkPlayer(index: number): boolean {
    if(index == -1) {
      if(this.mainPlayerId != "") {
        return true
      }
      return false
    }

    if(this.playerIds && this.playerIds[index])
      return true
    return false
  }

}
