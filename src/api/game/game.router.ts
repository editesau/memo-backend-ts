import { Router } from 'express'
import * as authMiddleware from '@middlewares/authMiddleware'
import * as gameController from '@game/game.controller'
import * as validationMiddleware from '@middlewares/vaidationMiddleware'
export const gameRouter = Router()

gameRouter.post('/start', authMiddleware.checkAccessToken, validationMiddleware.gameStart, gameController.start)
gameRouter.post('/:id/reset', authMiddleware.checkAccessToken, gameController.reset)
