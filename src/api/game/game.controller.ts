import { getTypesDir } from '@helpers/tools'
import { Empty } from '@helpers/types'
import { generateCards } from '@services/gameEngine.service'
import { UserIdLocals } from '@user/user.model'
import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { GameGetTypesResponseBody, GameIdBody, gameModel, GameStartRequestBody } from './game.model'


export const start: RequestHandler<Empty, GameIdBody, GameStartRequestBody, Empty, UserIdLocals> = async (req, res, next) => {
  const userId = res.locals.userId
  const { gameType: type, level } = req.body
  const cards = generateCards(parseInt(level), type)
  try {
    const result = await gameModel.create({ cards, userId, level, type})
    if (result) {
      const game = result.toJSON()
      return res.status(201).json({gameId: game._id.toString()})
    } else {
      const error = createHttpError(500, 'Error when try to create new game')
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

export const reset: RequestHandler<GameIdBody, Empty, Empty, Empty, UserIdLocals> = async (req, res, next) => {
  const userId = res.locals.userId
  const { gameId } = req.params
  try {
    const currentGame = await gameModel.findOne({userId, gameId})
    if (currentGame) {
      const { type, level} = currentGame.toJSON()
      const newCards = generateCards(level, type)
      currentGame.cards = newCards
      try {
        await currentGame.save()
        return res.sendStatus(200)
      } catch (error) {
        return next(error)
      }
    } else {
      const error = createHttpError(500, 'Error when try to reset game')
      return next(error)
    }
  } catch (error) {
    return next(error)
  }
}

export const getTypes: RequestHandler<Empty, GameGetTypesResponseBody> = async (req, res, next) => {
  try {
    const types = getTypesDir()
    return res.json({ types })
  } catch(error) {
    return next(error)
  }
}