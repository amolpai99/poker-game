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
  potAmount: number = 0;

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
      let gameData: any;
      if("game" in data) {
        gameData = data["game"]
        delete data["game"]
      }
      this.gameService.setNewState(data);
      this.processGameState(gameData)
    })
  }

  processGameState(gameData: any) {
    if(!gameData) {
      return
    }

    console.log("GameComponent: Received game data: ", gameData)
    for(let state_data of gameData) {
      let state = state_data["state"]
      let data = state_data["data"]

      switch(state) {
        case "update_pot":
          let amount = data["amount"]
          this.potAmount = amount;
          break;
      }
    }
  }

  sendState(state: string, data?: any) {
    let gameData = {
      "game": {
        "state": state,
        "data": data
      }
    }

    this.client.sendCurrentState(gameData)
  }

  // Temporary action to start game
  startGame() {
    this.showButton = false;
    if(this.isCreator) {  
      let data = {
        "new_round": true
      }
      this.sendState("start_game", data)
    }
  }

  // Temporary action to open table card
  openCard() {
    this.sendState("open_cards")
  }

  // Check if player exists or not
  checkPlayer(index: number): boolean {
    if(this.playerIds && this.playerIds[index])
      return true
    return false
  }

}
