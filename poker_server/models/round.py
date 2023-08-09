'''
    Module for handling data related to specific round in the game
'''
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class RoundDetails:
    '''
        Data class for handling data for a specific round
        :param: round_num
        :param: pot_amount
        :param: player_bet_amounts
        :param: selected_cards
    '''
    round_num: int
    pot_amount: int
    player_bet_amounts: Dict[str, int]
    selected_cards: List[int]
    small_blind_player_id: Optional[str] = None
    large_blind_player_id: Optional[str] = None

    def update(self, key, value):
        '''
            Update the specific key-value pair in database
        '''
        if hasattr(self, key):
            setattr(self, key, value)

    def add_bet_amount(self, player_id, player_amount):
        if player_id not in self.player_bet_amounts:
            self.player_bet_amounts[player_id] = player_amount
        else:
            self.player_bet_amounts[player_id] += player_amount

    def reset_bet_amounts(self):
        self.player_bet_amounts = {}
