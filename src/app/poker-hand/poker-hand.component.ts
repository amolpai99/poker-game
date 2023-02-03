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
  handSequence: {} = {};

  pokerHand: findPokerHand

  winner: string;
  winningHand: string;

  constructor(private cardsService: CardsService) {
    this.pokerHand = new findPokerHand()
  }

  ngOnInit() {
    while(this.cardsService.getTableCards()?.length < 5);

    // Get the table cards
    let tableCards = this.cardsService.getTableCards();
    // Get the hand cards of all players
    let allHandCards = this.cardsService.getAllHandCards();

    let allCards: number[] = []
    for(let hand in allHandCards) {
      let handCards = allHandCards[hand]
      
      // Create array of player + table cards
      allCards = [...handCards, ...tableCards]

      let maxVal = 0;
      let maxHand = 0;

      for(let i=0; i<allCards.length; i++) {
        for(let j=i+1; j<allCards.length; j++) {
          // Select 5 cards from the 7 cards
          let subarr = allCards.filter((_, index) => {
            return index != i && index != j;
          })
  
          // Get the best possible combination from the 5 cards
          let result = this.pokerHand?.getHand(subarr) || [0, 0];
          if(result[1] > maxHand) {
            maxHand = result[1];
            maxVal = result[0];
          }
  
        }
      }

      // Store the poker hand of each player
      this.handSequence[hand] = {
        maxValue: maxVal,
        hand: maxHand
      }
    }

    // Find the winner of the poker game
    let maxHand = 0;
    for(let hand in this.handSequence) {
      let seq = this.handSequence[hand]
      if(seq["hand"] > maxHand) {
        this.winner = hand;
        maxHand = seq["hand"]
        this.winningHand = HandRanks[maxHand]
      }
    }
    
  }

}

// Finds the best possible poker hand from 5 cards
class findPokerHand {
  allCards: number[];
  cardNumbers: number[];
  cardSuits: number[];

  constructor() {

  }

  // Getter function to get the best possible hand
  getHand(allCards: number[]): [number, HandRanks] {
    this.allCards = allCards;
    this.cardNumbers = [];
    this.cardSuits = [];

    this.allCards.sort((a, b) => {return a-b});

    // Since the array passed contains numbers from 1 to 52,
    // get the card numbers and suits from the array
    for(let i=0; i<allCards.length; i++) {
      this.cardNumbers.push((allCards[i] % 13 + 1));
      this.cardSuits.push(Math.floor((allCards[i] - 1) / 13));
    }

    this.cardNumbers.sort((a, b) => {return a-b});

    //TODO: Optimize this to use a for loop for looping through all functions
    let result: [number, boolean];
    result = this.isStraightFlushOrRoyalFlush()
    if(result[1] == true) {
      return [result[0], HandRanks.StraighFlush]
    }

    result = this.isFourOfAKind()
    if(result[1] == true) {
      return [result[0], HandRanks.FourOfAKind]
    }

    result = this.isFullHouse()
    if(result[1] == true) {
      return [result[0], HandRanks.FullHouse]
    }

    result = this.isFlush()
    if(result[1] == true) {
      return [result[0], HandRanks.Flush]
    }

    result = this.isStraight()
    if(result[1] == true) {
      return [result[0], HandRanks.Straight]
    }

    result = this.isThreeOfAKind()
    if(result[1] == true) {
      return [result[0], HandRanks.ThreeOfAKind]
    }

    result = this.isTwoPair()
    if(result[1] == true) {
      return [result[0], HandRanks.TwoPair]
    }

    result = this.isPair()
    if(result[1] == true) {
      return [result[0], HandRanks.Pair]
    }

    result = this.isHighCard()
    return [result[0], HandRanks.HighCard]

  }

  // Get the counts of each number and return the number of counts equal to val
  getCounts(val: number) {
    let cardCounts: any = {};
    this.cardNumbers.forEach(i => {cardCounts.hasOwnProperty(i) ? cardCounts[i]++ : cardCounts[i]=1});

    let count = 0, maxVal = 0;
    for(let num in cardCounts) {
      if(cardCounts[num] == val) {
        count++;
        maxVal = parseInt(num);
      }
    }

    return [maxVal, count];
  }

  // Check whether straight or royal flush
  isStraightFlushOrRoyalFlush(): [number, boolean]  {
    let straight = this.isStraight();
    let flush = this.isFlush();

    if(flush[1] == false || straight[1] == false) {
      return [0, false]
    }

    return [flush[0], true]

  }

  // Check whether four of a kind
  isFourOfAKind(): [number, boolean]  {
    let counts = this.getCounts(4);
    if(counts[1] == 1) {
      return [counts[0], true]
    }

    return [0, false]
  }

  // Check whether full house
  isFullHouse(): [number, boolean]  {
    let pairCount = this.getCounts(2);
    let threeCount = this.getCounts(3);
    if(pairCount[1] == 1 && threeCount[1] == 1) {
      let maxVal = Math.max(pairCount[0], threeCount[0]);
      return [maxVal, true]
    }

    return [0, false]
  }

  // Check whether flush
  isFlush(): [number, boolean]  {
    let flush = this.cardSuits.every((val, _, arr) => val === arr[0])
    return [this.allCards.at(-1) || 0, flush]
  }

  // Check whether straight
  isStraight(): [number, boolean]  {
    let cards = this.cardNumbers
    for(let i=1; i<cards.length; i++) {
      if(cards[i] == 10 && cards[i-1] == 1)
        continue
      if((cards[i] - cards[i-1]) != 1) {
        return [0, false]
      }
    }

    return [cards.at(-1) || 0, true]
  }

  // Check whether three of a kind
  isThreeOfAKind(): [number, boolean]  {
    let counts = this.getCounts(3);
    if(counts[1] == 1) {
      return [counts[0], true]
    }

    return [0, false]
  }

  // Check whether two pair
  isTwoPair(): [number, boolean]  {
    let counts = this.getCounts(2);
    if(counts[1] == 2) {
      return [counts[0], true]
    }

    return [0, false]
  }

  // Check whether pair
  isPair(): [number, boolean]  {
    let counts = this.getCounts(2);
    if(counts[1] == 1) {
      return [counts[0], true]
    }

    return [0, false]
  }

  // Check high card
  isHighCard(): [number, boolean] {
    return [this.allCards.at(-1) || 0, true];
  }
}
