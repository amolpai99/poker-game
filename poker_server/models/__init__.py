'''
    Module-level init file
'''
from .game import GameDetails
from .player import PlayerDetails
from .round import RoundDetails, PlayerRoundState, KeyPlayerIds
from .states import State

class BaseClass:
    def __init__(self):
        pass

    def __getitem__(self):
        pass
