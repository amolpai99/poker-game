'''
    Simple server side implementation for handling the poker game
    Responsible for recording all the operations performed during the game,
    including betting, cards generation and finding the winner.
'''
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, Namespace
# from poker.poker import PokerHand
from poker.games import Games

app = Flask(__name__)
CORS(app)

sock = SocketIO(app, cors_allowed_origins="*")

game_controller = Games()

class GenericNamespace(Namespace):
    '''
        Generic namespace class for registering new namespace with server
    '''
    def __init__(self, namespace, game_id):
        self.namespace = namespace
        self.game_id = game_id
        super().__init__(namespace)

    def on_connect(self):
        '''
            on_connect function is triggered on "connect" event
        '''
        print("Connection successful with game: ", self.game_id)

    def on_generate_cards(self):
        '''
            Socket event for generating the cards
            The server will generate new cards and emit them to all the clients
            connected to the socket. It will also find the winner of the poker game
            TODO: Separate the logic of finding winner to separate function since
                the winner can be found only after all rounds of betting are done
        '''
        cards = game_controller.generate_cards(self.game_id)
        sock.emit('get_cards', cards, namespace=self.namespace)

# @sock.on('generate')
# def get_cards(game_id):
#     '''
#         Socket event for generating the cards
#         The server will generate new cards and emit them to all the clients
#         connected to the socket. It will also find the winner of the poker game
#         TODO: Separate the logic of finding winner to separate function since
#               the winner can be found only after all rounds of betting are done
#     '''
#     cards = game_controller.generate_cards(game_id)
#     sock.emit('get_cards', cards)
    # poker_cls = PokerHand()
    # winners, winning_hand = poker_cls.get_winner(ALL_CARDS)
    # sock.emit('winner', {"winners": winners, "winning_hand": winning_hand["sequence"].name})

@app.route("/game", methods=["POST"])
def create_or_join_game():
    '''
        Create new game or join some existing game
    '''
    data = request.get_json()
    player_name = data["player_name"]
    join_game = data.get("join_game", False)
    game_id = None
    if join_game:
        game_id = data.get("game_id", None)
        if game_id is None:
            return "Game name cannot be none when joining game", 400

        try:
            game_controller.join_new_game(player_name, game_id)

            namespace = "/" + game_id
            sock.emit("new_player", {"player_name": player_name}, namespace=namespace)
        except Exception as ex:
            return str(ex), 400

    else:
        game_id = game_controller.create_new_game(player_name)
        namespace = "/" + game_id
        new_namespace_handler = GenericNamespace(namespace, game_id)
        sock.on_namespace(new_namespace_handler)

    game_details = {
        "game_id": game_id,
        "game_details": game_controller.get_game_details(game_id)
    }
    return jsonify(game_details), 200

if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=5000)
    sock.run(app, host="localhost", port=5000)
