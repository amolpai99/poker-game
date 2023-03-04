'''
    Simple server side implementation for handling the poker game
    Responsible for recording all the operations performed during the game,
    including betting, cards generation and finding the winner.
'''
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from poker.poker import PokerHand
from poker.games import Games

app = Flask(__name__)
CORS(app)

sock = SocketIO(app, cors_allowed_origins="*")

ALL_CARDS = None

game_controller = Games()

def generate(num_players):
    '''
        Generates new cards for each of the num_players
        and five cards for the table
    '''
    selected = []
    global ALL_CARDS
    ALL_CARDS = {}
    card_numbers = list(range(1,53))

    table_cards = []
    for _ in range(5):
        num = random.choice(card_numbers)
        while num in selected:
            num = random.choice(card_numbers)
        selected.append(num)
        table_cards.append(num)
    ALL_CARDS["table"] = table_cards

    for num_x in range(num_players):
        player_cards = []
        player_name = "player"+str(num_x+1)

        for _ in range(2):
            num = random.choice(card_numbers)
            while num in selected:
                num = random.choice(card_numbers)
            selected.append(num)
            player_cards.append(num)
        ALL_CARDS[player_name] = player_cards

@sock.on('generate')
def get_cards(num_players):
    '''
        Socket event for generating the cards
        The server will generate new cards and emit them to all the clients
        connected to the socket. It will also find the winner of the poker game
        TODO: Separate the logic of finding winner to separate function since
              the winner can be found only after all rounds of betting are done
    '''
    generate(num_players)
    sock.emit('get_cards', ALL_CARDS)
    poker_cls = PokerHand()
    winners, winning_hand = poker_cls.get_winner(ALL_CARDS)
    sock.emit('winner', {"winners": winners, "winning_hand": winning_hand["sequence"].name})

@app.route("/create", methods=["POST"])
def create_new_game():
    '''
        Create new game and return name of game to client
    '''
    print("Reached here")

    data = request.get_json()
    username = data["username"]
    if username == "":
        return "Username is empty", 404

    game_name = game_controller.create_new_game(username)
    game_details = {
        "game_name": game_name,
        "players": game_controller.get_game_details(game_name)
    }

    sock.emit('game_details', game_details)
    return jsonify(game_details), 200

@app.route("/join", methods=["POST"])
def join_new_game():
    '''
        Join new game specified by game_name for player "username"
    '''
    data = request.get_json()
    username = data["username"]
    game_name = data["game_name"]
    if username == "" or game_name == "":
        return "Username/Game Name is empty", 404

    try:
        game_controller.join_new_game(username, game_name)
    except Exception as e:
        return str(e), 400

    game_details = {
        "game_name": game_name,
        "players": game_controller.get_game_details(game_name)
    }

    sock.emit('game_details', game_details)
    return jsonify(game_details), 200


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
