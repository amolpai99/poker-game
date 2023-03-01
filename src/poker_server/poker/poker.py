'''
    Script to find the winner of poker game
'''
import enum
import itertools
from functools import cmp_to_key

class HandRanks(enum.Enum):
    '''
        Hand Rankings for Poker Game
    '''
    HighCard = 0
    Pair = 1
    TwoPair = 2
    ThreeOfAKind = 3
    Straight = 4
    Flush = 5
    FullHouse = 6
    FourOfAKind = 7
    StraightFlush = 8
    RoyalFlush = 9

GREATER='greater'
EQUAL='equal'
SMALLER='smaller'

def cmp(num_a, num_b):
    '''
        Custom comparator for sorting poker cards
    '''
    if num_a == 1:
        return 1
    if num_b == 1:
        return -1
    return num_a-num_b

def compare_lists(list_a, list_b):
    '''
        Compare two lists of poker cards
    '''
    for (num_a, num_b) in zip(list_a, list_b):
        if num_a == num_b:
            continue
        if num_a == 1:
            return GREATER
        if num_b == 1:
            return SMALLER
        if num_a > num_b:
            return GREATER
        if num_a < num_b:
            return SMALLER
    return EQUAL

def compare_hands(player, winner):
    '''
        Compare two hands to determine winner
    '''
    if winner == {}:
        return GREATER

    player_seq, winner_seq = player["sequence"], winner["sequence"]
    if player_seq.value > winner_seq.value:
        return GREATER

    if player_seq.value == winner_seq.value:
        player_seq_cards, winner_seq_cards = player["seq_cards"], winner["seq_cards"]
        val = compare_lists(player_seq_cards, winner_seq_cards)
        if val != EQUAL:
            return val

        player_cards, winner_cards = player["cards"], winner["cards"]
        val = compare_lists(player_cards, winner_cards)
        return val

    return SMALLER

class PokerHand:
    '''
        PokerHand class to find the best poker hand from cards
    '''
    numbers = []
    suits = []

    def get_winner(self, player_cards):
        '''
            Get the winner of the poker game
        '''
        all_player_winning_hands = {}
        table_cards = player_cards["table"]
        for player in player_cards:
            if player == "table":
                continue

            player_winning_hand = {}

            all_cards = table_cards + player_cards[player]
            for arr in list(itertools.combinations(all_cards, 5)):
                numbers = []
                suits = []
                for num in arr:
                    numbers.append(num % 13 + 1)
                    suits.append((num - 1) / 13)
                hand = self.get_poker_hand(numbers, suits)

                if compare_hands(hand, player_winning_hand) == GREATER:
                    player_winning_hand = hand

            all_player_winning_hands[player] = player_winning_hand

        winners = []
        winning_hand = {}
        for player in all_player_winning_hands:
            hand = all_player_winning_hands[player]
            compare_val = compare_hands(hand, winning_hand)
            if compare_val == GREATER:
                winning_hand = hand
                winners = [player]
            elif compare_val == EQUAL:
                winners.append(player)

        return winners, winning_hand

    def get_poker_hand(self, numbers, suits):
        '''
            Get the best possible poker hand made from numbers
        '''
        funcs = [
            self.is_straight_or_royal_flush,
            self.is_four_of_a_kind,
            self.is_full_house,
            self.is_flush,
            self.is_straight,
            self.is_three_of_a_kind,
            self.is_two_pairs,
            self.is_pair,
            self.is_high_card
        ]

        key = cmp_to_key(cmp)
        self.numbers = numbers
        self.suits = suits
        self.numbers.sort(key=key)

        for func in funcs:
            seq_cards, seq, check = func()
            if check:
                return {
                    "cards": numbers,
                    "seq_cards": seq_cards,
                    "sequence": seq
                }

        return None, None

    def get_counts(self, val):
        '''
            Get counts of each value in numbers
            Check whether any count is equal to val
        '''
        counts = {}
        for num in self.numbers:
            if num in counts:
                counts[num] += 1
            else:
                counts[num] = 1

        count = 0
        pairs = []
        for key in counts:
            if counts[key] == val:
                count += 1
                pairs.append(key)

        return count, pairs

    def is_straight_or_royal_flush(self):
        '''
            Check if sequence is straight/royal flush
        '''
        _, _, check_flush = self.is_flush()
        _, straight_cards, check_straight = self.is_straight()

        if check_flush is False or check_straight is False:
            return None, None, False

        if straight_cards[-1] == 1:
            return straight_cards, HandRanks.RoyalFlush, True

        return straight_cards, HandRanks.StraightFlush, True


    def is_four_of_a_kind(self):
        '''
            Check if sequence is four-of-a-kind
        '''
        count, fours = self.get_counts(4)
        if count == 1:
            return fours, HandRanks.FourOfAKind, True
        return None, None, False


    def is_full_house(self):
        '''
            Check if sequence is full-house
        '''
        pair_count, pairs = self.get_counts(2)
        three_count, threes = self.get_counts(3)
        if pair_count == 1 and three_count == 1:
            return threes+pairs, HandRanks.FullHouse, True
        return None, None, False


    def is_flush(self):
        '''
            Check if sequence is flush
        '''
        if len(set(self.suits)) == 1:
            return [self.numbers[-1]], HandRanks.Flush, True
        return None, None, False


    def is_straight(self):
        '''
            Check if sequence is straight
        '''
        i = 1
        numbers = self.numbers
        while i < len(numbers):
            if numbers[i-1] == 13 and numbers[i] == 1:
                continue
            if (numbers[i] - numbers[i-1]) != 1:
                return None, None, False
            i += 1
        return numbers, HandRanks.Straight, True


    def is_three_of_a_kind(self):
        '''
            Check if sequence is three-of-a-kind
        '''
        count, threes = self.get_counts(3)
        if count == 1:
            return threes, HandRanks.ThreeOfAKind, True
        return None, None, False


    def is_two_pairs(self):
        '''
            Check if sequence is two-pairs
        '''
        count, pairs = self.get_counts(2)
        if count == 2:
            return pairs, HandRanks.TwoPair, True
        return None, None, False


    def is_pair(self):
        '''
            Checks if sequence is pair
        '''
        count, pairs = self.get_counts(2)
        if count == 1:
            return pairs, HandRanks.Pair, True
        return None, None, False


    def is_high_card(self):
        '''
            Returns high card
        '''
        return [self.numbers[-1]], HandRanks.HighCard, True

if __name__=="__main__":
    cards = {"player1":[5,30],"player2":[49,29],"player3":[1,16],"table":[34,31,48,9,11]}
    poker_hand = PokerHand()
    winning_player, winning_player_hand = poker_hand.get_winner(cards)
    print(winning_player)
    print(winning_player_hand["sequence"].name)
