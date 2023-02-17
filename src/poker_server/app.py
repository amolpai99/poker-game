import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from poker.poker import PokerHand

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

@app.route("/cards", methods=["GET", "POST"])
def generate_cards():
    if request.method == "POST":
        num_players = int(request.args.get("num_players", 1))
        generate(num_players)
        print(all_cards)
        return jsonify({"cards": all_cards})
    if request.method == "GET":
        player_name = request.args.get("player", None)
        player_cards = {"cards": ""}
        if player_name is not None and all_cards is not None:
            player_cards = all_cards[player_name]
        return jsonify({"cards": player_cards})

    return "Wrong method", 405

@app.route("/get_winner", methods=["GET"])
def get_winner():
    if all_cards is None:
        return jsonify({"winners": None})

    poker_cls = PokerHand()
    winners, winning_hand = poker_cls.get_winner(all_cards)
    return jsonify({"winners": winners, "winning_hand": winning_hand["sequence"].name})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
