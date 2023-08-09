import logging
from typing import Dict
import models
from middleware import GameCache

logger = logging.getLogger(__name__)

class BaseStateHandler():
    def __init__(self, game_cache):
        self.game_id = None
        self.game_cache: GameCache = game_cache
        self.game_details: models.GameDetails = None

    def get_state(self):
        '''
            Get currently executing state
        '''
        raise NotImplementedError("Get State function not implemented")

    def handle_state(self, game_id, data, player_id=None):
        '''
            Handle execution of new state
        '''
        raise NotImplementedError("Handle state function not implemented")
