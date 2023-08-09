'''
    Module for handling data related to single game
'''
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from .player import PlayerDetails
from .round import RoundDetails
from .states import State

@dataclass
class GameDetails:
    '''
        Data class for a particular game
        :param: game_name
        :param: num_players
        :param: players
        :param: round_details
    '''
    game_name: str
    num_players: int
    players: Dict[str, PlayerDetails]
    round_details: RoundDetails
    _desired_states: Optional[List[State]] = None

    def update(self, key, value):
        '''
            Update the specific key-value pair in database
        '''
        if hasattr(self, key):
            setattr(self, key, value)

    def add_state(self, desired_state: State):
        '''
            Add new state to list of desired states
        '''
        if self._desired_states:
            self._desired_states.append(desired_state)
        else:
            self._desired_states = [desired_state]

    def clear_states(self):
        '''
            Clear all desired states
        '''
        self._desired_states = None

    @property
    def desired_states(self):
        desired_states_obj = []
        if self._desired_states:
            for obj in self._desired_states:
                desired_states_obj.append(obj)
        return desired_states_obj

    @desired_states.setter
    def desired_states(self, desired_states: List[State]):
        if desired_states:
            self._desired_states = desired_states
