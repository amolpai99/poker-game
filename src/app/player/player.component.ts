import { Component, Input } from '@angular/core';
import { GameService, PlayerDetails } from '../services/game.service';
import { ClientService } from '../services/client.service';

const TOTAL_TIME = 15
// Pre-calculated arc length
const TOTAL_TIMER_ARC = 331.4
const COLORS = ['green', 'yellow', 'red']


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  // playerType indicates whether the player is the main player, table or a secondary player
  @Input('type') playerType: string = "secondary";
  // player details containing name, id and class of the player
  @Input('player_class') playerClass: string;
  @Input('player_id') playerId: string;

  player: PlayerDetails;
  mainPlayerId: string;

  // Cards of the player
  cards: number[] | undefined;

  // array to determine which cards to open
  openCards: string[] = [];
  // openPlayerCards denotes if the cards have been opened
  openPlayerCards: boolean;

  // Timer specific data
  startTimer: boolean;
  timer: Timer;


  constructor(
    private client: ClientService,
    private gameService: GameService) {
  }

  ngOnInit() {
    this.timer = new Timer(this.playerClass);
    this.player = this.gameService.getPlayer(this.playerId);
    this.mainPlayerId = this.gameService.mainPlayerId;
    this.cards = this.player.cards;

    console.log("PlayerComponent: ", "Player ID: ", this.playerId, " | Player: ", this.player);

    // TODO: Move this to separate function which will get called when new game starts
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

    this.player.obs$?.subscribe((params) => {
      if(params) {
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Received params", params)
        for(let player_data of params) {
          let state = player_data.state
          let data = player_data.data
          console.log("PlayerComponent: ", "Player ID:", this.playerId, "State: ", state, "Data:", data)
          this.processState(state, data)
        }
      }
    })
  }

  processState(state: string, data: any) {
    switch(state) {
      case "get_cards":
        this.cards = data["cards"]
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Got cards:", this.cards)
        break;
      
      case "open_cards":
        if(this.playerId == "player0") {
          let card = data["card"]
          if(card == "turn") {
            this.openCards[3] = "true"
          }
          else if(card == "river") {
            this.openCards[4] = "true"
          }
        }
        else {
          this.openCards = ["true", "true"]
          this.openPlayerCards = true
        }
        break;

      case "place_bet":
        console.log("PlayerComponent", "Player ID:", this.playerId, "Received state:", state, "Starting Timer")
        this.startTimer = true
        this.timer.startTimer()
        break;

      case "update_stack":
        console.log("PlayerComponent:", "Player ID:", this.playerId, "Updating stack of player", this.playerId)
        this.startTimer = false
        this.timer.stopTimer()
    }
  }

  placeBet() {
    this.timer.stopTimer()
    this.startTimer = false

    let state = {}
    state[this.playerId] = {
      "state": "bet_placed",
      "data": {
        "amount": 100
      }
    }
    
    this.client.sendCurrentState(state)
  }

  getHandClass() {
    if(this.openPlayerCards) {
      return this.playerClass+"_cards_open"
    }
    return this.playerClass+"_cards"
  }
}

class Timer {
  // Timer specific data
  timeRemaining: number;
  private timer: NodeJS.Timer;

  private playerClass: string;

  constructor(playerClass: string) {
    this.playerClass = playerClass
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  startTimer() {
    let timePassed = 0;
    // Start arc animation one second earlier
    // this.setTimerArc(timePassed + 1);

    this.timeRemaining = TOTAL_TIME;
    this.timer = setInterval(() => {
      timePassed += 1;
      // Set the remaining time
      this.timeRemaining = TOTAL_TIME - timePassed;

      // Set the timer ring
      this.setTimerArc(timePassed + 1);

      if(timePassed == TOTAL_TIME) {
        this.stopTimer()
      }

    }, 1000)

    
  }

  setTimerArc(timePassed: number) {
    let timeRemaining = TOTAL_TIME - timePassed;
    let timerArcRemaining = (timeRemaining / TOTAL_TIME) * TOTAL_TIMER_ARC;
    let attribute = timerArcRemaining + " " + TOTAL_TIMER_ARC
    let id = 'timer_' + this.playerClass
    document
          .getElementById(id)
          ?.setAttribute('stroke-dasharray', attribute);  


    if(timeRemaining == 10) {
      document
            .getElementById(id)
            ?.setAttribute('stroke', '#EFE34F')
    }

    if(timeRemaining == 5) {
      
      document
            .getElementById(id)
            ?.setAttribute('stroke', '#CB2D03')
    }

  }
}