'''
    Module for handling data related to single player
'''
from typing import List, Optional
from dataclasses import dataclass, asdict
from .states import State

@dataclass
class PlayerDetails:
    '''
        Data class for handling player-related data
        :param: name
        :param: cards
        :param: stack
    '''
    name: str
    cards: List[int]
    stack: int
    current_state: Optional[State] = None
    _desired_states: Optional[List[State]] = None

    def update(self, key, value):
        '''
            Update the specific key-value pair in database
        '''
        if hasattr(self, key):
            setattr(self, key, value)

    def add_state(self, desired_state: State):
        if self._desired_states:
            self._desired_states.append(desired_state)
        else:
            self._desired_states = [desired_state]

    def clear_states(self):
        self._desired_states = None

    @property
    def desired_states(self):
        desired_states_obj = []
        if self._desired_states:
            for obj in self._desired_states:
                desired_states_obj.append(obj)
        return desired_states_obj

    @desired_states.setter
    def desired_states(self, desired_states=None):
        if desired_states:
            self._desired_states = desired_states
