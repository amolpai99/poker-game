'''
    Module for caching game data
'''
import logging
from dataclasses import asdict
from typing import Dict
import models
from db.database import Database

logger = logging.getLogger(__name__)

class GameCache:
    '''
        Class for caching the game data
    '''
    __game_data_cached: Dict[str, models.GameDetails]

    def __init__(self):
        self.database = Database()
        self.__game_data_cached = {}

    def create(self, game_id, data):
        '''
            Create new game and store the game in cache
        '''
        # Add validation that game_id does not exist in database

        self.database.create(game_id=game_id, data=data)
        self.__game_data_cached[game_id] = data

    def get(self, game_id):
        '''
            Get details about game identified by game_id
            If details not present in cache, fetch it from database and update cache.
        '''
        if game_id not in self.__game_data_cached:
            game_details = self.database.read(game_id=game_id)
            self.__game_data_cached[game_id] = game_details
        return self.__game_data_cached[game_id]

    def save(self, game_id, update_fields=None):
        '''
            Update the data for particular game in database
            :param: game_id: ID of the game
            :update_fields: List specifying the field name and new data for the field
        '''
        if update_fields is None:
            return

        # logger.info("GameCache: Saving to database for game_id: %s. Data: %s", game_id, update_fields)
        self.database.save(game_id=game_id, update_fields=update_fields)
        self.__game_data_cached[game_id] = self.database.read(game_id=game_id)
        # logger.info("GameCache: Got new data from cache after saving: %s", self.__game_data_cached[game_id])


    def get_all_states(self, game_id):
        game_details = self.get(game_id)
        if not game_details:
            logger.warning("Game details is None")
            return None

        # logger.info("GameCache: Got game data: %s", game_details)
        all_states = {}
        if game_details.desired_states:
            desired_states = []
            for state in game_details.desired_states:
                desired_states.append(asdict(state))
            all_states["game"] = desired_states

        players: Dict[str, models.PlayerDetails] = game_details.players
        for player_id in players:
            player = players[player_id]
            if player.desired_states:
                desired_states = []
                for state in player.desired_states:
                    desired_states.append(asdict(state))
                all_states[player_id] = desired_states

        return all_states

    def clear_states(self, game_id):
        '''
            Clear all states for the game as well as individual players
        '''
        game_details = self.get(game_id)
        if not game_details:
            logger.warning("Game Details is none")
            return

        game_details.clear_states()
        players: Dict[str, models.PlayerDetails] = game_details.players
        for player_id in players:
            player = players[player_id]
            player.clear_states()
