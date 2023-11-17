import logging
from typing import Dict
from utils.constants import CONFIG, States
import utils
import models

logger = logging.getLogger(__name__)


def generate_new_game(game_id: str, game_details: models.GameDetails, game_cache):
    players: Dict[str, models.PlayerDetails] = game_details.players
    round_details = game_details.round_details
    if not players:
        return

    player_ids = players.keys()
    player_cards = utils.generate_cards(player_ids)
    selected_cards = sum(list(player_cards.values()), [])

    dealer, small_blind, big_blind = utils.get_key_player_ids(players, game_details.num_players)

    round_details.selected_cards = selected_cards
    round_details.key_player_ids = models.KeyPlayerIds(dealer=dealer, small_blind=small_blind, big_blind=big_blind)

    for player_id in players:
        player: models.PlayerDetails = players[player_id]

        cards = player_cards.get(player_id)
        data = {}
        if cards:
            player.cards = cards
            data = {"cards": cards}

        desired_state = models.State(state=States.PlayerStates.GET_CARDS, data=data)
        player.add_state(desired_state=desired_state)
        round_details.update_player_state(player_id=player_id, player_state=States.RoundStates.ACTIVE, player_amount=None)

        # Receive small blind amount as input from user during game creation
        if player_id == small_blind:
            # Start with sending minimum bet amount as small blind
            data = {"amount": game_details.minimum_bet_amount}
            desired_state = models.State(state=States.PlayerStates.PLACE_BET, data=data)
            player.add_state(desired_state=desired_state)

    round_details.current_bet_amount = game_details.minimum_bet_amount
    round_details.round_num = 1

    game_cache.save(game_id=game_id, update_fields=[{"players": players}, {"round_details": round_details}])
