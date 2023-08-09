'''
    Module for defining various constants
'''

class Configuration:
    TABLE_ID = "player0"
    TABLE_NAME = "table"
    NUM_PLAYERS = 11
    PLAYER_IDS = []
    GAME_NAME = "texas-holdem-poker"

    TURN = "turn"
    RIVER = "river"

    def __init__(self):
        for player in range(self.NUM_PLAYERS + 1):
            self.PLAYER_IDS.append("player" + str(player))

class States:
    class GameStates:
        START_GAME = "start_game"
        OPEN_CARDS = "open_cards"
        GET_CARDS = "get_cards"
        UPDATE_POT = "update_pot"

    class PlayerStates:
        PLACE_BET = "place_bet"
        BET_PLACED = "bet_placed"
        UPDATE_STACK = "update_stack"
        OPEN_CARDS = "open_cards"

CONFIG = Configuration()
States = States()
