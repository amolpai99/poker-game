import { Component, Input } from '@angular/core';
import { ClientService } from '../services/client.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  @Input('player') playerClass: string;
  @Input('name') playerName: string;
  @Input('id') playerId: string;
  @Input('type') playerType: string = "secondary";
  @Input('player_details') player: any;

  openCards: string[] = [];
  isOpen: boolean;

  cards: number[];

  constructor(
    private client: ClientService,
    private gameService: GameService) {      
  }

  ngOnInit() {
    console.log("ngInit called: ", this.player)

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
      this.cards = playerDetails[this.player.id]["cards"]
    });

    if(this.player.id == "player0") {
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
        if(players.indexOf(this.player.id) != -1) {
          this.openCards = ["true", "true"];
          this.isOpen = true;
        }
      })
    }
  }

  getHandClass() {
    if(this.isOpen) {
      return this.player.class+"_cards_open"
    }
    return this.player.class+"_cards"
  }
}
