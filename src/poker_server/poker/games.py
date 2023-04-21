'''
    Script for storing and managing all the games
'''

import random
import string

GAME_NAMES = [
    "admiring",
    "adoring",
    "affectionate",
    "agitated",
    "amazing",
    "angry",
    "awesome",
    "beautiful",
    "blissful",
    "bold",
    "boring",
    "brave",
    "busy",
    "charming",
    "clever",
    "cool",
    "compassionate",
    "competent",
    "condescending",
    "confident",
    "cranky",
    "crazy",
    "dazzling",
    "determined",
    "distracted",
    "dreamy",
    "eager",
    "ecstatic",
    "elastic",
    "elated",
    "elegant",
    "eloquent",
    "epic",
    "exciting",
    "fervent",
    "festive",
    "flamboyant",
    "focused",
    "friendly",
    "frosty",
    "funny",
    "gallant",
    "gifted",
    "goofy",
    "gracious",
    "great",
    "happy"
]

class Games():
    '''
        Games class for storing all games
    '''
    def __init__(self):
        self.games_list = {}

    def create_new_game(self, username):
        '''
            Create new game for player "username"
            Name of game is randomized from GAME_NAMES
        '''
        game_name = GAME_NAMES[random.choice(list(range(1, len(GAME_NAMES))))]
        while game_name in self.games_list:
            game_name = GAME_NAMES[random.choice(list(range(1, len(GAME_NAMES))))]

        letters = string.ascii_lowercase
        id1 = ''.join(random.choice(letters) for i in range(4))
        id2 = ''.join(random.choice(letters) for i in range(4))
        game_id = id1 + "-" + id2

        new_game = {
            "game_name": game_name,
            "players": [username],
            "current_round_cards": None,
            "selected_card_numbers": [],
            "round_num": 0
        }
        self.games_list[game_id] = new_game

        return game_id

    def join_new_game(self, player_name, game_id):
        '''
            Join a new game with name as "game_name"
            Raise Exception if the game does not exist
        '''
        if game_id not in self.games_list:
            raise Exception("Game %s not present" % (game_id))

        if self.games_list[game_id]["players"]:
            self.games_list[game_id]["players"].append(player_name)
        else:
            self.games_list[game_id]["players"] = [player_name]
        return True

    def get_game_details(self, game_id):
        '''
            Get game details for specific game
        '''
        return self.games_list[game_id]

    def generate_cards(self, game_id, new_round=False):
        '''
            Generate random cards for all players and table
        '''
        card_numbers = list(range(1,53))

        current_game_details = self.games_list[game_id]
        player_names = current_game_details["players"]
        selected_cards_from_deck = current_game_details["selected_card_numbers"]

        current_cards = current_game_details["current_round_cards"]

        def get_cards(num_cards):
            player_cards = []
            for _ in range(num_cards):
                num = random.choice(card_numbers)
                while num in selected_cards_from_deck:
                    num = random.choice(card_numbers)
                selected_cards_from_deck.append(num)
                player_cards.append(num)
            return player_cards

        if current_cards is None or new_round:
            current_cards = {}
            table_cards = get_cards(5)
            current_cards["table"] = table_cards
            for name in player_names:
                player_cards = get_cards(2)
                current_cards[name] = player_cards
        else:
            for name in player_names:
                if name in current_cards:
                    continue
                player_cards = get_cards(2)
                current_cards[name] = player_cards

        current_game_details["current_round_cards"] = current_cards
        self.games_list[game_id] = current_game_details
        return current_cards
