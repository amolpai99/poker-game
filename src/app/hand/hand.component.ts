import { Component, Inject, Input } from '@angular/core';
import { ClientService } from '../services/client.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss']
})
export class HandComponent {
  @Input("player") playerId: string;
  @Input("player_type") playerType: string = "secondary";

  openCards: string[] = [];

  cards: number[];

  constructor(
    private client: ClientService,
    private gameService: GameService) {      
  }

  ngOnInit() {
    console.log("ngInit called: ", this.playerId, this.playerType)
    switch(this.playerType) {
      case "secondary": 
        this.openCards = ["false", "false"]
        break
      case "primary":
        this.openCards = ["true", "true"]
        break
      case "table":
        this.openCards = ["true", "true", "true", "false", "false"]
    }

    this.client.getCards().subscribe((playerDetails) => {
      this.cards = playerDetails[this.playerId]["cards"]
    });

    if(this.playerId == "player0") {
      this.client.openTableCards().subscribe((data) => {
        if("open_turn" in data) {
          this.openCards[3] = "true"
        }
        else if("open_river" in data) {
          this.openCards[3] = "true"
          this.openCards[4] = "true"
        }
      })
    }
    else {
      this.client.openPlayerCards().subscribe((players) => {
        if(players.indexOf(this.playerId) != -1) {
          this.openCards = ["true", "true"]
        }
      })
    }
  }
}
