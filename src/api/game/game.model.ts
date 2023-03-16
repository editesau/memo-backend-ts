import mongoose from 'mongoose'
import { z } from 'zod'

const Card = z.object({
  id: z.string().uuid(),
  picture: z.string(),
  isOpen: z.boolean(),
  isMatched: z.boolean()
}) 

const openedCardsItem = Card.omit({isOpen: true, isMatched: true})

const Game = z.object({
  state: z.string(),
  cards: z.array(Card),
  type: z.string(),
  userId: z.string(),
  openedCards: z.array(openedCardsItem),
  level: z.number()
})

export const GameStartRequestBody = z.object({
  level: z.string().min(2),
  gameType: z.string().nonempty()
})

type Game = z.infer<typeof Game>
export type Card = z.infer<typeof Card>

export interface GameIdBody {
  gameId: string
}

export type GameStartRequestBody = z.infer<typeof GameStartRequestBody>
export interface GameGetTypesResponseBody {
  types: string[]
}

type GameModel = mongoose.Model<Game>

const gameSchema = new mongoose.Schema<Game>({
  state: { type: String, default: 'In progress' },
  type: { type: String, required: true },
  openedCards: { type: [Object], default: [], required: true },
  cards: { type: [Object], required: true },
  userId: { type: String, required: true },
  level: { type: Number, required: true}
})

export const gameModel = mongoose.model<Game, GameModel>('games_test', gameSchema)