'''
    Script for storing and managing all the games
'''
import random
import string
import logging
import models
import middleware
from utils.constants import CONFIG
from states import GameStateHandler, PlayerStateHandler

logger = logging.getLogger(__name__)

class GameHandler():
    '''
        Games class for storing all games
    '''
    def __init__(self):
        self.game_cache = middleware.GameCache()
        self.game_states_handler = GameStateHandler(self.game_cache)
        self.player_states_handler = PlayerStateHandler(self.game_cache)

    def create_new_game(self, username):
        '''
            Create new game for player "username"
            Name of game is randomized from GAME_NAMES
        '''
        data = {
            "username": username
        }
        if "username" not in data:
            raise Exception("Username not present in data")

        letters = string.ascii_lowercase
        id1 = ''.join(random.choice(letters) for i in range(4))
        id2 = ''.join(random.choice(letters) for i in range(4))
        game_id = id1 + "-" + id2

        game_name = CONFIG.GAME_NAME + "-" + game_id

        table_details = models.PlayerDetails(CONFIG.TABLE_NAME, None, 0)
        new_player_details = models.PlayerDetails(data["username"], None, data.get("initial_stack", 1000))
        players = dict(player0=table_details, player1=new_player_details)

        round_details = models.RoundDetails(round_num=0, pot_amount=0, player_bet_amounts={}, selected_cards=[])
        new_game = models.GameDetails(game_name=game_name, num_players=1, players=players, round_details=round_details)

        logger.info("Creating new game: %s", new_game)

        # Create new game in database
        self.game_cache.create(game_id=game_id, data=new_game)
        return game_id


    def join_new_game(self, player_name, game_id):
        '''
            Join a new game with name as "game_name"
            Raise Exception if the game does not exist
        '''
        data = {
            "username": player_name
        }
        game_details: models.GameDetails = self.game_cache.get(game_id)

        num_players = game_details.num_players + 1
        players = game_details.players

        player_id = CONFIG.PLAYER_IDS[num_players]
        new_player_details = models.PlayerDetails(name=data["username"], cards=None, stack=data.get("initial_stack", 1000))
        players[player_id] = new_player_details

        self.game_cache.save(game_id, update_fields=[{"players": players}, {"num_players": num_players}])
        return player_id

    def get_game_details(self, game_id):
        '''
            Get game details for specific game
        '''
        return self.game_cache.get(game_id)


    def get_next_state(self, game_id, data):
        '''
            Process the current data and get the next state
        '''
        for player_id in data:
            if player_id == "game":
                # Process game data
                logger.info("GameHandler: Handling state for game. Data: %s", data[player_id])
                self.game_states_handler.handle_state(game_id=game_id, data=data[player_id])
            elif player_id == "table":
                # Process table data
                continue
            else:
                # Process player data
                logger.info("GameHandler: Handling state for player. Data: %s", data[player_id])
                self.player_states_handler.handle_state(game_id=game_id, data=data[player_id], player_id=player_id)

        new_states = self.game_cache.get_all_states(game_id)
        logger.info("GameHandler: Got All States: %s", new_states)
        return new_states
