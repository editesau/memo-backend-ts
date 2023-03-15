import { Empty } from '@helpers/types'
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
  openedCards: z.array(openedCardsItem)
})

type Game = z.infer<typeof Game>
type Card = z.infer<typeof Card>

export interface GameResetRequestParams {
  gameId: string
}

export interface GameStartRequestBody {
  level: string
  gameType: string
}

type GameModel = mongoose.Model<Game, Empty, Empty>

const gameSchema = new mongoose.Schema<Game>({
  state: { type: String, default: 'In progress' },
  type: { type: String, required: true },
  openedCards: { type: [Object], default: [], required: true },
  cards: { type: [Object], required: true },
  userId: { type: String, required: true },
})

export const gameModel = mongoose.model<Game, GameModel>('games_test', gameSchema)