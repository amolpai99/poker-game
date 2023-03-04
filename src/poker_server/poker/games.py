'''
    Script for storing and managing all the games
'''

import random

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

        self.games_list[game_name] = {}
        self.games_list[game_name]["players"] = [username]
        return game_name

    def join_new_game(self, username, game_name):
        '''
            Join a new game with name as "game_name"
            Raise Exception if the game does not exist
        '''
        if game_name not in self.games_list:
            raise Exception("Game %s not present" % (game_name))

        if self.games_list[game_name]["players"]:
            self.games_list[game_name]["players"].append(username)
        else:
            self.games_list[username]["players"] = [username]
        return True

    def get_game_details(self, game_name):
        '''
            Get game details for specific game
        '''
        return self.games_list.get(game_name, None)
