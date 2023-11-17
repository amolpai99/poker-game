'''
    Simple server side implementation for handling the poker game
    Responsible for recording all the operations performed during the game,
    including betting, cards generation and finding the winner.
'''
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, Namespace
from handlers.game_handler import GameHandler

logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s %(filename)s:%(lineno)s %(message)s",
)

logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

sock = SocketIO(app, cors_allowed_origins="*")

game_handler = GameHandler()

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
        logger.info("Connection successful with game: %s", self.game_id)

    def on_current_state(self, data):
        logger.info("Got current state: %s", data)
        # try:
        new_data = game_handler.get_next_state(self.game_id, data)
        logger.info("New state: %s", new_data)
        sock.emit("next_state", new_data, namespace=self.namespace)
        # except Exception as e:
        #     logger.info("Encountered exception while starting new game: %s", str(e))
        #     sock.emit("next_state", data={"errors": f"Encountered error while starting game: {str(e)}"}, namespace=self.namespace)


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
            player_id = game_handler.join_new_game(player_name, game_id)

            namespace = "/" + game_id
            sock.emit("new_player", {"name": player_name, "id": player_id}, namespace=namespace)
        except Exception as ex:
            logger.error("Got exception while trying to join game for player: %s. Ex: %s", player_name, str(ex))
            return str(ex), 400

    else:
        game_id = game_handler.create_new_game(player_name)
        namespace = "/" + game_id
        new_namespace_handler = GenericNamespace(namespace, game_id)
        sock.on_namespace(new_namespace_handler)

    game_details = {
        "game_id": game_id,
        "game_details": game_handler.get_game_details(game_id)
    }
    return jsonify(game_details), 200

if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=5000)
    sock.run(app, host="localhost", port=5000)
