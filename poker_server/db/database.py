'''
    Database module for CRUD operations on game data
'''
import logging
from models import GameDetails, PlayerDetails, RoundDetails

logger = logging.getLogger(__name__)

class Database:
    '''
        Database class for CRUD operations on games data
    '''
    def __init__(self):
        self.games_list = {}

    def create(self, game_id, data):
        '''
            Create new game and return game id
        '''
        try:
            self.games_list[game_id] = data
        except Exception as e:
            raise e

    def read(self, game_id):
        '''
            Read game details of specific game
        '''
        if game_id not in self.games_list:
            logging.warning("Could not find %s in %s", game_id, self.games_list)
            return None
        game_details = self.games_list[game_id]
        # logger.info("Found game with game_id %s: %s", game_id, game_details)
        return game_details

    def add_player(self, game_id, data):
        '''
            Add new player to game data given by game_id
        '''
        game_details: GameDetails = self.read(game_id)
        if game_details is None:
            logger.error("Could not add player with data: %s. No game found with id: %s", data, game_id)
            return None

        num_players = game_details.num_players + 1
        players = game_details.players
        game_details.update("num_players", num_players)

        player_id = "player" + str(game_details.num_players)
        new_player_details = PlayerDetails(name=data["username"], cards=None, stack=data.get("initial_stack", 1000))
        players[player_id] = new_player_details
        game_details.update("players", players)

        logger.info("Added new player: %s", new_player_details)
        return player_id

    def delete(self):
        pass

    def save(self, game_id, update_fields=None):
        if game_id not in self.games_list:
            logger.warning("Game ID not present in games list")
            return

        logger.info("Database: Saving data to database for game_id %s. Data: %s", game_id, update_fields)
        game_details: GameDetails = self.games_list[game_id]
        for fields in update_fields:
            for key, value in fields.items():
                game_details.update(key, value)
