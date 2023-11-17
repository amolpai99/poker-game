'''
    Module for handling data related to specific round in the game
'''
from typing import Dict, List, Optional
from utils.constants import States
from dataclasses import dataclass

@dataclass
class PlayerRoundState:
    state: States.RoundStates
    current_round_bet_amount: int
    total_bet_amount: int

@dataclass
class KeyPlayerIds:
    dealer: str
    small_blind: Optional[str] = ""
    big_blind: Optional[str] = ""

@dataclass
class RoundDetails:
    '''
        Data class for handling data for a specific round
        :param: round_num
        :param: pot_amount
        :param: current_player_states
        :param: selected_cards
        :param: small_blind_amount
        :param: current_bet_amount
        :param: key_player_ids
    '''
    round_num: int
    pot_amount: int
    selected_cards: List[int]
    # Initial bet amount for small blind
    small_blind_amount: int

    current_player_states: Dict[str, PlayerRoundState]
    '''
    Current player state. State can be:
    - Active
    - Folded
    '''

    # Current bet amount that each player must match
    current_bet_amount: Optional[int] = 0

    # Information about small and big blind
    key_player_ids: Optional[KeyPlayerIds] = None

    def update(self, key, value):
        '''
            Update the specific key-value pair in database
        '''
        if hasattr(self, key):
            setattr(self, key, value)

    def update_player_state(self, player_id, player_state, player_amount):
        if player_id not in self.current_player_states:
            self.current_player_states[player_id] = PlayerRoundState(state=player_state, current_round_bet_amount=None, total_bet_amount=0)
        else:
            current_player = self.current_player_states[player_id]
            current_player.state = player_state
            current_player.current_round_bet_amount = player_amount
            if player_amount:
                current_player.total_bet_amount += player_amount
            else:
                current_player.total_bet_amount = 0


    def reset_player_states(self):
        for player_id in self.current_player_states:
            player = self.current_player_states[player_id]
            if player.state != States.RoundStates.FOLDED:
                player.current_round_bet_amount = None
            else:
                del self.current_player_states[player_id]

    def get_player_state(self, player_id):
        if player_id not in self.current_player_states:
            return None

        return self.current_player_states[player_id]

    def get_active_players(self):
        active_players = {}
        for player in self.current_player_states:
            player_state = self.current_player_states[player]
            if player_state.state == States.RoundStates.ACTIVE:
                active_players[player] = player_state
        return active_players
