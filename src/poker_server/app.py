import random
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

all_cards = None

@app.route('/')
def hello():
    return 'Hello, World!'

def generate(num_players):
    selected = []
    global all_cards
    all_cards = {}
    card_numbers = list(range(1,53))

    table_cards = []
    for _ in range(5):
        num = random.choice(card_numbers)
        while num in selected:
            num = random.choice(card_numbers)
        selected.append(num)
        table_cards.append(num)
    all_cards["table"] = table_cards

    for x in range(num_players):
        player_cards = []
        player_name = "player"+str(x+1)

        for _ in range(2):
            num = random.choice(card_numbers)
            while num in selected:
                num = random.choice(card_numbers)
            selected.append(num)
            player_cards.append(num)
        all_cards[player_name] = player_cards

@app.route("/generate")
def generate_cards():
    num_players = int(request.args.get("num_players", 1))
    if all_cards is None:
        generate(num_players)
    return jsonify({"success": True})

@app.route("/get_cards", methods=["GET"])
def get_cards():
    player_name = request.args.get("player", None)
    if all_cards is None or player_name is None:
        return ""

    cards = all_cards.get(player_name, None)
    return jsonify({"cards": cards})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
