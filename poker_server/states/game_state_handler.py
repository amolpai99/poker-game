import logging
import random
from typing import Dict
import models
from utils.constants import States, CONFIG
from .base import BaseStateHandler

logger = logging.getLogger(__name__)

class GameStateHandler(BaseStateHandler):
    def handle_state(self, game_id, data, player_id=None):
        logger.info("GameStateHandler: Handling state for game_id %s: %s", game_id, data)
        state = data["state"]
        self.game_details = self.game_cache.get(game_id=game_id)
        self.game_cache.clear_states(game_id=game_id)

        if state == States.GameStates.START_GAME:
            logger.info("GameStateHandler: Generating cards")
            self._generate_cards(game_id, data)

            logger.info("GameStateHandler: Starting game")
            return self._start_game(game_id)
        if state == States.GameStates.OPEN_CARDS:
            return self._open_cards()
        return None

    def get_state(self):
        pass

    def _generate_cards(self, game_id, data):
        new_round = data.get("new_round", False)
        card_numbers = list(range(1,53))

        game_details: models.GameDetails = self.game_cache.get(game_id)
        player_details: Dict[str, models.PlayerDetails] = game_details.players
        round_details: models.RoundDetails = game_details.round_details
        selected_cards_from_deck = round_details.selected_cards

        logger.info("GameStateHandler:\n\nGame Details: %s\nPlayers Details: %s\nRound Details: %s\nSelected cards: %s\n", game_details, player_details, round_details, selected_cards_from_deck)

        def get_cards(num_cards, selected_cards):
            player_cards = []
            for _ in range(num_cards):
                num = random.choice(card_numbers)
                while num in selected_cards:
                    num = random.choice(card_numbers)
                selected_cards.append(num)
                player_cards.append(num)
            return player_cards

        for player in player_details:
            if not new_round and player_details[player].cards is not None:
                continue
            if player == CONFIG.TABLE_ID: # table cards
                cards = get_cards(5, selected_cards=selected_cards_from_deck)
            else:
                cards = get_cards(2, selected_cards=selected_cards_from_deck)
            selected_cards_from_deck.extend(cards)
            player_details[player].cards = cards

        round_details.selected_cards = selected_cards_from_deck
        logger.info("GameStateHandler: Selected cards: %s", selected_cards_from_deck)

        self.game_cache.save(game_id=game_id, update_fields=[{"players": player_details}, {"round_details": round_details}])


    def _start_game(self, game_id):
        new_state = States.GameStates.GET_CARDS

        game_details: models.GameDetails = self.game_cache.get(game_id)
        players = game_details.players
        if not players:
            return

        for player_id in players:
            player: models.PlayerDetails = players[player_id]
            data = None
            if player.cards:
                data = {"cards": player.cards}

            desired_state = models.State(state=new_state, data=data)
            player.add_state(desired_state=desired_state)

            small_blind_player = data.get("small_blind", "player1")
            if player_id == small_blind_player:
                desired_state = models.State(state=States.PlayerStates.PLACE_BET, data={})
                player.add_state(desired_state=desired_state)

        self.game_cache.save(game_id=game_id, update_fields=[{"players": players}])

    def _open_cards(self):
        pass
