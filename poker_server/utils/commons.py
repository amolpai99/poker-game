import logging
import random
from .constants import CONFIG

logger = logging.getLogger(__name__)


def get_key_player_ids(all_players, num_players):
    if num_players == 1:
        return None, None, None

    player_num = 0
    dealer_id = None
    while dealer_id not in all_players:
        player_num = (player_num % num_players) + 1
        dealer_id = CONFIG.PLAYER_IDS[player_num]

    small_blind_id = None
    while small_blind_id not in all_players:
        player_num = (player_num % num_players) + 1
        small_blind_id = CONFIG.PLAYER_IDS[player_num]

    big_blind_id = None
    while big_blind_id not in all_players:
        player_num = (player_num % num_players) + 1
        big_blind_id = CONFIG.PLAYER_IDS[player_num]

    return dealer_id, small_blind_id, big_blind_id


def generate_cards(player_ids):
    card_numbers = list(range(1,53))

    selected_cards_from_deck = []

    # logger.info("GameStateHandler:\n\nGame Details: %s\nPlayers Details: %s\nRound Details: %s\nSelected cards: %s\n", game_details, player_details, round_details, selected_cards_from_deck)

    def get_cards(num_cards, selected_cards):
        player_cards = []
        for _ in range(num_cards):
            num = random.choice(card_numbers)
            while num in selected_cards:
                num = random.choice(card_numbers)
            selected_cards.append(num)
            player_cards.append(num)
        return player_cards

    player_cards = {}
    for player_id in player_ids:
        # if player_details[player].cards is not None:
        #     continue
        if player_id == CONFIG.TABLE_ID: # table cards
            cards = get_cards(5, selected_cards=selected_cards_from_deck)
        else:
            cards = get_cards(2, selected_cards=selected_cards_from_deck)
        selected_cards_from_deck.extend(cards)
        player_cards[player_id] = cards

    logger.info("GameStateHandler: Selected cards: %s", selected_cards_from_deck)

    # self.game_cache.save(game_id=game_id, update_fields=[{"players": player_details}, {"round_details": round_details}])
    return player_cards
