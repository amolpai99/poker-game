import logging
from typing import Dict
import models
from .base import BaseStateHandler
from utils.constants import States, CONFIG

logger = logging.getLogger(__name__)

class PlayerStateHandler(BaseStateHandler):
    def __init__(self, game_cache):
        super().__init__(game_cache=game_cache)
        self.player_id = None

    def handle_state(self, game_id, data, player_id=None):
        state = data.get("state")
        if not state:
            return
        state_data = data.get("data")
        self.game_id = game_id
        self.player_id = player_id
        self.game_details = self.game_cache.get(game_id=game_id)
        self.game_cache.clear_states(game_id=game_id)

        if state == States.PlayerStates.BET_PLACED:
            self._place_bet(state_data)

    def get_state(self):
        pass

    def _place_bet(self, data):
        '''
            Set state for next player to place bet, update stack of current player
        '''
        players: Dict[str, models.PlayerDetails] = self.game_details.players
        round_details: models.RoundDetails = self.game_details.round_details

        logger.info("PlayerStateHandler: Got players: %s", players)

        current_player_id = self.player_id
        current_player = players[current_player_id]
        current_amount = data.get("amount")

        # Update bet amount of that player
        round_details.add_bet_amount(current_player_id, current_amount)
        # Update pot amount
        round_details.pot_amount += current_amount

        # Update stack for current player
        desired_state = models.State(state=States.PlayerStates.UPDATE_STACK, data={})
        current_player.add_state(desired_state=desired_state)

        # Find next player that needs to place bet
        round_number = round_details.round_num
        if round_number < 3:
            player_num = int(current_player_id[-1])
            logger.info("PlayerStateHandler: Player Num: %d", player_num)
            next_player_num = player_num + 1 if player_num < self.game_details.num_players else 1
            logger.info("PlayerStateHandler: Next Player num: %d, Num players: %d", next_player_num, self.game_details.num_players)
            next_player_id = CONFIG.PLAYER_IDS[next_player_num]
            next_player: models.PlayerDetails = players[next_player_id]
            desired_state = models.State(state=States.PlayerStates.PLACE_BET, data={})
            next_player.add_state(desired_state=desired_state)


        if next_player_num == round_details.small_blind_player_id:
            self.open_cards(round_number)
            round_number = round_number + 1
            round_details.round_num = round_number

        desired_state = models.State(state=States.GameStates.UPDATE_POT, data={"amount": round_details.pot_amount})
        self.game_details.add_state(desired_state=desired_state)

        self.game_cache.save(self.game_id, update_fields=[{"players": players, "round_details": round_details, "desired_states": self.game_details.desired_states}])

    def open_cards(self, round_num):
        players = self.game_details.players
        if round_num in (0, 1):
            card_to_open = CONFIG.TURN if round_num == 0 else CONFIG.RIVER
            desired_state = models.State(state=States.PlayerStates.OPEN_CARDS, data={"card": card_to_open})
            table: models.PlayerDetails = players[CONFIG.TABLE_ID]

            table.add_state(desired_state=desired_state)
        else:
            for player_id in players:
                if player_id == CONFIG.TABLE_ID:
                    continue

                player: models.PlayerDetails = players[player_id]
                desired_state = models.State(state=States.PlayerStates.OPEN_CARDS, data={})
                player.add_state(desired_state=desired_state)
        self.game_cache.save(self.game_id, update_fields=[{"players": players}])
