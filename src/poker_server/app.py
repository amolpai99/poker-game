'''
    Simple server side implementation for handling the poker game
    Responsible for recording all the operations performed during the game,
    including betting, cards generation and finding the winner.
'''
import random
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from poker.poker import PokerHand

app = Flask(__name__)
CORS(app)

sock = SocketIO(app, cors_allowed_origins="*")

ALL_CARDS = None

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


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
