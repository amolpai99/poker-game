import { Component } from '@angular/core';
import { CardsService } from '../services/cards.service';

enum HandRanks {
  HighCard = 0,
  Pair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraighFlush,
  RoyalFlush
}

@Component({
  selector: 'app-poker-hand',
  templateUrl: './poker-hand.component.html',
  styleUrls: ['./poker-hand.component.scss']
})
export class PokerHandComponent {
  allPlayers: {} = {};
  playerNames = ["player1", "player2", "player3"]

  pokerHand: findPokerHand

  winners: string[];
  winningHand: string;

  constructor(private cardsService: CardsService) {
    this.pokerHand = new findPokerHand()
  }

  compare(player: {}, winner: {}) {
    if(JSON.stringify(winner) == '{}') {
      return "greater"
    }

    let compareFn = (a: number[], b: number[]) => {
      let val = "equal";
      for(let i=a.length-1; i>=0; i--) {
        if(a[i] == b[i])
          continue
        if(a[i] == 1) {
          val = "greater"
        } 
        else if(b[i] == 1) {
          val = "smaller"
        }
        else if(a[i] > b[i]) {
          val = "greater"
        }
        else {
          val = "smaller"
        }
        break
      }
      return val
    }

    let playerCards = player["cards"], playerSeq = player["hand"]["sequence"], playerSeqCards = player["hand"]["cards"]
    let winnerCards = winner["cards"], winnerSeq = winner["hand"]["sequence"], winnerSeqCards = winner["hand"]["cards"]
    
    if(playerSeq > winnerSeq) {
      return "greater"
    }

    else if (playerSeq == winnerSeq) {
      let val = compareFn(playerSeqCards, winnerSeqCards)
      if(val != "equal") {
        return val
      }

      val = compareFn(playerCards, winnerCards)
      return val
    }

    return "smaller"
  }

  ngOnInit() {
    this.calculateWinner()
  }

  calculateWinner() {
    // Get the table cards
    let tableCards: number[];
    // this.cardsService.getCards("table").subscribe((cards) => {
    //   tableCards = cards;
    // });
    let playerCards: {};

    this.playerNames.forEach((player) => {
      // this.cardsService.getCards(player).subscribe((cards) => {
      //   playerCards[player] = cards  
      // })
    })

    this.playerNames.forEach((player) => {
      // Create array of player + table cards
      let allCards = [...playerCards[player], ...tableCards]

      let playerWinningHand: {} = {};

      for(let i=0; i<allCards.length; i++) {
        for(let j=i+1; j<allCards.length; j++) {
          // Select 5 cards from the 7 cards
          let subarr = allCards.filter((_, index) => {
            return index != i && index != j;
          })

          let numbers: number[] = [], suits: number[] = [];
          subarr.sort((a, b) => {return a-b})
          subarr.forEach(num => {
            numbers.push(num % 13 + 1)
            suits.push(Math.floor((num - 1) / 13));
          })
  
          // Get the best possible combination from the 5 cards
          let result = this.pokerHand.getHand(numbers, suits);
          let playerHand = {
            cards: numbers,
            hand: result
          }

          // Update the winning hand if the new hand is better
          let val = this.compare(playerHand, playerWinningHand)
          if(val == "greater") {
            playerWinningHand = playerHand
          }
        }
      }

      // Store the poker hand of each player
      this.allPlayers[player] = playerWinningHand
    
    })

    // Find the winner of the poker game
    let winningPlayer = {};
    this.winners = [];
    for(let player in this.allPlayers) {
      let val = this.compare(this.allPlayers[player], winningPlayer)
      switch(val) {
        case "greater":
          winningPlayer = this.allPlayers[player]
          this.winningHand = HandRanks[winningPlayer["hand"]["sequence"]]
          this.winners = [player]
          break
        case "equal":
          this.winners.push(player)
      }
    }
    
  }

}

// Finds the best possible poker hand from 5 cards
class findPokerHand {
  numbers: number[];
  suits: number[];

  constructor() {

  }

  // Getter function to get the best possible hand
  getHand(numbers: number[], suits: number[]): {} {
    this.numbers = numbers;
    this.suits = suits;

    this.numbers.sort((a, b) => {
      if(a == 1)
        return 1;
      if(b == 1)
        return -1;
      return a-b;
    });

    //TODO: Optimize this to use a for loop for looping through all functions
    let result: {};
    result = this.isStraightFlushOrRoyalFlush()
    if(result["check"] == true) {
      return result
    }

    result = this.isFourOfAKind()
    if(result["check"] == true) {
      return result
    }

    result = this.isFullHouse()
    if(result["check"] == true) {
      return result
    }

    result = this.isFlush()
    if(result["check"] == true) {
      return result
    }

    result = this.isStraight()
    if(result["check"] == true) {
      return result
    }

    result = this.isThreeOfAKind()
    if(result["check"] == true) {
      return result
    }

    result = this.isTwoPair()
    if(result["check"] == true) {
      return result
    }

    result = this.isPair()
    if(result["check"] == true) {
      return result
    }

    result = this.isHighCard()
    return result

  }

  // Get the counts of each number and return the number of counts equal to val
  getCounts(val: number) {
    let cardCounts: any = {};
    this.numbers.forEach(i => {cardCounts.hasOwnProperty(i) ? cardCounts[i]++ : cardCounts[i]=1});

    let count = 0, pairs: number[] = [];
    for(let num in cardCounts) {
      if(cardCounts[num] == val) {
        count++;
        pairs.push(parseInt(num));
      }
    }

    return {
      count: count,
      pairs: pairs.reverse()
    };
  }

  // Check whether straight or royal flush
  isStraightFlushOrRoyalFlush(): {}  {
    let straight = this.isStraight();
    let flush = this.isFlush();

    if (flush["check"] == false || straight["check"] == false) {
      return {check: false}
    }

    if (straight["straight"] == 13 && this.numbers.includes(1)) {
      return {
        cards: [straight["straight"]],
        sequence: HandRanks.RoyalFlush,
        check: true
      }
    }

    return {
      cards: [straight["straight"]],
      sequence: HandRanks.StraighFlush,
      check: true
    }

  }

  // Check whether four of a kind
  isFourOfAKind(): {}  {
    let fours = this.getCounts(4);
    if(fours["count"] == 1) {
      return {
        cards: [fours["pairs"][0]],
        sequence: HandRanks.FourOfAKind,
        check: true
      }
    }

    return {check: false}
  }

  // Check whether full house
  isFullHouse(): {}  {
    let pairs = this.getCounts(2);
    let threes = this.getCounts(3);
    if(pairs["count"] == 1 && threes["count"] == 1) {
      return {
        cards: [threes["pairs"][0], pairs["pairs"][0]],
        sequence: HandRanks.FullHouse,
        check: true
      }
    }

    return {check: false}
  }

  // Check whether flush
  isFlush(): {}  {
    let flush = this.suits.every((val, _, arr) => val === arr[0])
    if(flush == true) {
      return {
        cards: [this.numbers.at(-1)],
        sequence: HandRanks.Flush,
        check: true
      }
    }

    return {check: false}
  }

  // Check whether straight
  isStraight(): {}  {
    let cards = this.numbers
    for(let i=1; i<cards.length; i++) {
      if(cards[i] == 10 && cards[i-1] == 1)
        continue
      if((cards[i] - cards[i-1]) != 1) {
        return {check: false}
      }
    }

    return {
      cards: [cards.at(-1)],
      sequence: HandRanks.Straight,
      check: true
    }
  }

  // Check whether three of a kind
  isThreeOfAKind(): {}  {
    let threes = this.getCounts(3);
    if(threes["count"] == 1) {
      return {
        cards: [threes["pairs"][0]],
        sequence: HandRanks.ThreeOfAKind,
        check: true
      }
    }

    return {check: false}
  }

  // Check whether two pair
  isTwoPair(): {} {
    let pairs = this.getCounts(2);
    if(pairs["count"] == 2) {
      return {
        cards: pairs["pairs"],
        sequence: HandRanks.TwoPair,
        check: true
      }
    }

    return {check: false}
  }

  // Check whether pair
  isPair(): {}  {
    let pairs = this.getCounts(2);
    if(pairs["count"] == 1) {
      return {
        cards: [pairs["pairs"][0]],
        sequence: HandRanks.Pair,
        check: true
      }
    }

    return {check: false}
  }

  // Check high card
  isHighCard(): {} {
    return {
      cards: [this.numbers.at(-1)],
      sequence: HandRanks.HighCard,
      check: true
    }
  }
}
