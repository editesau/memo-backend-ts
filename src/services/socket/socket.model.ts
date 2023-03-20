import { Card } from '@src/api/game/game.model'

interface OpenCardData {
  gameId: string
  carId: string
}

interface GameData {
  cards: Card[]
  gameType: string
  state: string
}

export interface IncomingSocketEvents {
  GET_GAME: (gameId: string) => void
  OPEN_CARD: (data: OpenCardData) => void
}

export interface OutSocketEvents {
  GAME_LOADED: (data: GameData) => void
  LOCK_BOARD: () => void
  UNLOCK_BOARD: () => void
  GAME_FINISHED: () => void
  CARD_OPENED: (card: Card) => void
  MATCHED: (cardIds: [string, string]) => void
  MISMATCH: (cardIds: [string, string]) => void
  ERROR: (data: {message: string}) => void
}

export interface SocketData {
  userId: string
}