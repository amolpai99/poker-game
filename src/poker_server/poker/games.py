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
        self.table_id = "player0"

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

        player_details = {}
        player_details[self.table_id] = {
            "name": "table",
            "cards": None
        }

        player_details["player1"] = {
            "name": username,
            "cards": None
        }

        new_game = {
            "game_name": game_name,
            "num_players": 1,
            "players": player_details,
            "round_details": {
                "round_num": 0,
                "pot_amount": 0,
                "player_bet_amounts": {},
                "selected_card_numbers": [],

            }
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

        game_details = self.games_list[game_id]
        num_players = game_details["num_players"]
        player_id = "player" + str(num_players + 1)
        game_details["players"][player_id] = {
            "name": player_name,
            "cards": None
        }
        game_details["num_players"] = num_players+1
        return player_id

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

        game_details = self.games_list[game_id]
        player_details = game_details["players"]
        selected_cards_from_deck = game_details["round_details"]["selected_card_numbers"]

        def get_cards(num_cards):
            player_cards = []
            for _ in range(num_cards):
                num = random.choice(card_numbers)
                while num in selected_cards_from_deck:
                    num = random.choice(card_numbers)
                selected_cards_from_deck.append(num)
                player_cards.append(num)
            return player_cards

        for player in player_details:
            if not new_round and player_details[player]["cards"] is not None:
                continue
            if player == self.table_id: # table cards
                cards = get_cards(5)
            else:
                cards = get_cards(2)
            player_details[player]["cards"] = cards

        return "success"

    def update_player_state(self, params, player_id, state, data):
        if params.get(player_id, None):
            params[player_id].append({
                "state": state,
                "data": data
            })
        else:
            params[player_id] = [{
                "state": state,
                "data": data
            }]

    def open_cards(self, game_details, params):
        new_state = "open_cards"
        round_num = game_details["round_details"]["round_num"]

        if round_num in (0, 1):
            card_to_open = "turn" if round_num == 0 else "river"
            data = {"card": card_to_open}

            self.update_player_state(params, self.table_id, new_state, data)
        else:
            data = {}
            players = game_details["players"]
            for player_id in players:
                if player_id == "player0":
                    continue

                self.update_player_state(params, player_id, new_state, data)
        round_num = round_num + 1
        game_details["round_details"]["round_num"] = round_num
        return params


    def start_game(self, game_details, params):
        state = "get_cards"

        players = game_details["players"]
        for player_id in players:
            data = {"cards": players[player_id]["cards"]}
            self.update_player_state(params, player_id, state, data)

        # Send "place_bet" for first player to start the round
        state_place_bet = "place_bet"
        self.update_player_state(params, "player1", state_place_bet, {})
        return params

    def place_bet(self, game_details, current_player_id, player_data, next_state_data):
        '''
            Set state for next player to place bet, update stack of current player
        '''
        player_bet_amounts = game_details["round_details"]["player_bet_amounts"]
        self.update_player_state(next_state_data, current_player_id, "update_stack", {})

        player_bet_amount = player_data["amount"]
        if current_player_id not in player_bet_amounts:
            player_bet_amounts[current_player_id] = player_bet_amount
        else:
            player_bet_amounts[current_player_id] += player_bet_amount
        
        game_details["round_details"]["pot_amount"] += player_bet_amount

        player_num = int(current_player_id[-1])
        next_player_num = player_num + 1 if player_num < game_details["num_players"] else 1
        next_player_id = "player" + str(next_player_num)

        if next_player_id == "player1":
            self.open_cards(game_details, next_state_data)

        round_num = game_details["round_details"]["round_num"]
        if round_num < 3:
            self.update_player_state(next_state_data, next_player_id, "place_bet", [])

        self.update_player_state(next_state_data, "game", "update_pot", {"amount": game_details["round_details"]["pot_amount"]})
        return next_state_data

    def get_next_state(self, game_id, data):
        '''
            Process the current data and get the next state
        '''
        game_details = self.games_list[game_id]

        params = {}
        for player_id in data:
            # Process game data
            if player_id == "game":
                state = data[player_id]["state"]
                if state == "start_game":
                    self.generate_cards(game_id)

                    return self.start_game(game_details, params)
                if state == "open_cards":
                    self.open_cards(game_details, params)
                    return params

            # Process table data
            if player_id == "table":
                return None

            # Process player data
            player_state = data[player_id]["state"]
            player_data = data[player_id].get("data", None)
            if player_state == "bet_placed":
                self.place_bet(game_details, player_id, player_data, params)

                # Go to next state
                return params
        return None
