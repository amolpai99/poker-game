'''
    Module for handling game states
'''
import logging
import models
from utils.constants import States
from .commons import generate_new_game
from .base import BaseStateHandler

logger = logging.getLogger(__name__)

class GameStateHandler(BaseStateHandler):
    '''
        Class for handling game states
    '''
    def handle_state(self, game_id, data, player_id=None):
        logger.info("GameStateHandler: Handling state for game_id %s: %s", game_id, data)
        state = data["state"]
        self.game_details: models.GameDetails = self.game_cache.get(game_id=game_id)
        self.game_cache.clear_states(game_id=game_id)

        if state == States.GameStates.START_GAME:
            if self.game_details.num_players == 1:
                raise Exception("Cannot start game. Minimum number of players required: 2")
            return generate_new_game(game_id, self.game_details, self.game_cache)
        if state == States.GameStates.OPEN_CARDS:
            return self._open_cards()
        return None

    def get_state(self):
        pass

    def _open_cards(self):
        pass
