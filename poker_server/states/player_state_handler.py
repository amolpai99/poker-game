'''
    Module for handling player states
'''
import logging
from typing import Dict
import models
from utils.constants import States, CONFIG, PlayerActions
from .base import BaseStateHandler

logger = logging.getLogger(__name__)

class PlayerStateHandler(BaseStateHandler):
    '''
        Class for handling player states
    '''
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

        current_player = players[self.player_id]
        current_player_state = round_details.get_player_state(self.player_id)

        player_action = data["action"]
        player_previous_bet_amount = 0
        if current_player_state.current_round_bet_amount:
            player_previous_bet_amount = current_player_state.current_round_bet_amount

        player_state = States.RoundStates.ACTIVE
        if player_action == PlayerActions.CALL:
            player_current_bet_amount = round_details.current_bet_amount
        elif player_action in (PlayerActions.BET, PlayerActions.RAISE):
            player_current_bet_amount = data.get("amount")
        elif player_action == PlayerActions.CHECK:
            player_current_bet_amount = 0
        elif player_action == PlayerActions.FOLD:
            player_state = States.RoundStates.FOLDED

        logger.info("PlayerStateHandler: Data for current player | Player ID: %s | Player action: %s | Player amount: %d", self.player_id, player_action, player_current_bet_amount)

        # Update state of current player
        round_details.update_player_state(player_id=self.player_id, player_state=player_state, player_amount=player_current_bet_amount)
        # Update pot amount
        round_details.pot_amount += (player_current_bet_amount - player_previous_bet_amount)
        # Update bet amount of current round
        round_details.current_bet_amount = player_current_bet_amount

        # Send state for game view to update the pot
        desired_state = models.State(state=States.GameStates.UPDATE_POT, data={"amount": round_details.pot_amount})
        logger.info("PlayerStateHandler: Adding state for game | New state: %s", desired_state)
        self.game_details.add_state(desired_state=desired_state)

        # Send state for updating stack of current player
        data = {"state": current_player_state.state, "amount": (player_current_bet_amount - player_previous_bet_amount)}
        desired_state = models.State(state=States.PlayerStates.UPDATE_STACK, data=data)
        logger.info("PlayerStateHandler: Adding state for player %s | New state: %s", self.player_id, desired_state)
        current_player.add_state(desired_state=desired_state)

        active_players = round_details.get_active_players()
        logger.info("PlayerStateHandler: Active players found: %s", active_players)

        next_player_id = self.__find_next_player(self.player_id, round_details.current_bet_amount, active_players)
        logger.info("PlayerStateHandler: Next Player ID found: %s", next_player_id)

        if next_player_id == self.player_id:
            logger.info("PlayerStateHandler: All player bets matched or single player remaining. Moving to next round")
            round_details.current_bet_amount = 0
            round_details.reset_player_states()
            next_player_id = round_details.key_player_ids.small_blind

            self._open_cards(round_details.round_num)
            if round_details.round_num == CONFIG.MAX_ROUNDS:
                self.game_cache.save(self.game_id, update_fields=[{"players": players, "round_details": round_details}])
                return

            round_details.round_num += 1

        # Send state for next player to place bet
        next_player: models.PlayerDetails = players[next_player_id]
        desired_state = models.State(state=States.PlayerStates.PLACE_BET, data={"amount": round_details.current_bet_amount})
        logger.info("PlayerStateHandler: Adding state for player %s | New state: %s", next_player_id, desired_state)
        next_player.add_state(desired_state=desired_state)

        self.game_cache.save(self.game_id, update_fields=[{"players": players, "round_details": round_details, "desired_states": self.game_details.desired_states}])

    def __find_next_player(self, current_player_id: str, current_bet_amount: int, active_players: Dict[str, models.PlayerRoundState]):
        logger.info("PlayerStateHandler: Finding next player for placing bet")
        # Current player number
        player_num = CONFIG.PLAYER_IDS.index(current_player_id)
        logger.info("PlayerStateHandler: Current Player Number: %d", player_num)

        # Iterate through all players to find player whose state is active and bet has not matched
        next_player_num = (player_num % self.game_details.num_players) + 1
        next_player_id = CONFIG.PLAYER_IDS[next_player_num]
        while next_player_num != player_num:
            logger.info("PlayerStateHandler: Next Player Number: %d | Next Player ID: %s", next_player_num, next_player_id)
            if next_player_id not in active_players:
                next_player_num = (next_player_num % self.game_details.num_players) + 1
                next_player_id = CONFIG.PLAYER_IDS[next_player_num]
                continue

            # Check if the new player is currently active in game
            logger.info("PlayerStateHandler: Next Player ID %s found in active players: %s", next_player_id, active_players)
            player: models.PlayerRoundState = active_players[next_player_id]
            # Check if player has already bet the current bet amount
            if player.current_round_bet_amount != current_bet_amount:
                logger.info("PlayerStateHandler: Found next player ID %s not matching current bet amount", next_player_id)
                break

            logger.info("PlayerStateHandler: Next Player ID %s has already matched the bet amount. Moving on", next_player_id)
            next_player_num = (next_player_num % self.game_details.num_players) + 1
            next_player_id = CONFIG.PLAYER_IDS[next_player_num]

        logger.info("PlayerStateHandler: Next Player num: %d, Num players: %d", next_player_num, self.game_details.num_players)
        return next_player_id

    def _open_cards(self, round_num):
        players = self.game_details.players
        if round_num in (1, 2):
            card_to_open = CONFIG.TURN if round_num == 1 else CONFIG.RIVER
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
