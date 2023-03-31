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

  playerCssProperties = {
    "player1": {
      "title": {
        "right": "-10%"
      },
      "cards": {

      }
    },
    "player2": {
      "title": {
        "bottom": "0",
        "right": "10%"
      },
      "cards": {

      }
    },
    "player3": {
      "title": {
        "bottom": "0",
        "left": "10%"
      },
      "cards": {

      }
    },
    "player4": {
      "title": {
        "left": "-10%"
      },
      "cards": {

      }
    },
    "player5": {
      "title": {
        "left": "0"
      },
      "cards": {

      }
    },
    "player6": {
      "title": {
        "left": "-10%"
      },
      "cards": {

      }
    },
    "player7": {
      "title": {
        "top": "0",
        "right": "10%"
      },
      "cards": {

      }
    },
    "player8": {
      "title": {
        "top": "0"
      },
      "cards": {

      }
    },
    "player9": {
      "title": {
        "top": "0",
        "left": "10%"
      },
      "cards": {

      }
    },
    "player10": {
      "title": {
        "right": "-10%"
      },
      "cards": {

      }
    },
    "player11": {
      "title": {
        "right": "0"
      },
      "cards": {

      }
    },
    "dealer": {
      "title": {
        "bottom": "0"
      }
    }
  }

  constructor(
    private cardsService: CardsService) {

  }

  ngOnInit() {
    this.cardsService.generateCards(this.numPlayers)

    // this.playerNames = [];
    // for(let i=1; i<=this.numPlayers; i++) {
    //   this.playerNames.push("player"+i.toString())
    // }

    // this.cardsService.getWinner().subscribe((winner) => {
    //   this.winners = winner["winners"]
    //   this.winningHand = winner["winning_hand"]
    // })

    // this.cardsService.getGameDetails().subscribe((gameDetails) => {
    //   this.gameDetails = gameDetails
    //   this.tempString = JSON.stringify(gameDetails)
    // })

    for(var playerName in this.playerCssProperties) {
      let playerClasses = this.playerCssProperties[playerName];
      let playerObject = document.getElementById(playerName);
      for(var className in playerClasses) {
        playerObject?.style.setProperty(className, playerClasses[className])
      }
    }

  }

  getTitleClass(playerName: string) {
    return playerName + "_title"
  }

  generate() {
    this.cardsService.generateCards(this.numPlayers)
    
    this.cardsService.getWinner().subscribe((winner) => {
      this.winners = winner["winners"]
      this.winningHand = winner["winning_hand"]
    })

  }

}
