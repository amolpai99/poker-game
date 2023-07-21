import { GameDetails } from "./objects"

export const DEBUG = false
export const MOCK_GAME_DETAILS: GameDetails = {
  gameId: "mock",
  playerId: "player1",
  allPlayers: {
    "player0": {
      "name": "table",
      "stack": 0,
    },
    "player1": {
      name: "gamer32116",
      stack: 1000,
    },
    "player2": {
      name: "abolipai",
      stack: 1000,
    }
  },
  isCreator: true
}