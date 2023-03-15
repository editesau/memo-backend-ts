import { Empty } from "@helpers/types"
import { generateCards } from "@services/gameEngine.service"
import { UserIdLocals } from "@user/user.model"
import { RequestHandler } from "express"
import createHttpError from "http-errors"
import { GameIdBody, gameModel, GameStartRequestBody } from "./game.model"


export const start: RequestHandler<Empty, GameIdBody, GameStartRequestBody, Empty, UserIdLocals> = async (req, res, next) => {
  const userId = res.locals.userId
  const { gameType, level } = req.body
  const cards = generateCards(parseInt(level), gameType)

  try {
    const result = await gameModel.create({ cards, userId})
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