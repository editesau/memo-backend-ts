import request from 'supertest'
import { app } from '@src/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User } from '@user/user.model'
import { gameModel, GameStartRequestBody } from './game.model'

describe('Game', () => {
  let mongoServer: MongoMemoryServer
  let accessToken: string
  let gameId: string

  const newUser: User = { 
    email: 'user@test.com',
    password: '123456',
    userName: 'test'
  }

  const newGame: GameStartRequestBody = {
    level: '10',
    gameType: 'animals'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userName: _, ...loginUser } = newUser

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  describe('Game routes', () => {
    it('post /start without authorization -> 401 Unathorized', async () => {
      const res: request.Response = await request(app).post('/api/v1/game/start').send(newGame)
      expect(res.statusCode).toBe(401)
    })

    it('post /start with authorization -> 201 with created gameId in response', async () => {
      await request(app).post('/api/v1/user/signup').send(newUser).expect(201)
      const loginRes: request.Response = await request(app).post('/api/v1/user/signin').send(loginUser)
      expect(loginRes.statusCode).toBe(200)
      expect(loginRes.body).toHaveProperty('accessToken')
      accessToken = loginRes.body.accessToken
      const res: request.Response = await request(app).post('/api/v1/game/start').send(newGame).set('Authorization', `Bearer ${accessToken}`)
      expect(res.statusCode).toBe(201)
      expect(res.body).toHaveProperty('gameId')
      expect(mongoose.isValidObjectId(res.body.gameId)).toBeTruthy()
      gameId = res.body.gameId
    })

    it('post /reset with auth and correct id -> 200', async () => {
      const game = await gameModel.findById(gameId)
      const cards = game?.toJSON().cards
      const res: request.Response = await request(app).post(`/api/v1/game/${gameId}/reset`).set('Authorization', `Bearer ${accessToken}`)
      expect(res.statusCode).toBe(200)
      const resettedGame = await gameModel.findById(gameId)
      const resettedCards = resettedGame?.toJSON().cards
      expect(cards).not.toEqual(resettedCards)
    })

    it('post /reset without authorization -> 401 Unathorized', async () => {
      const res: request.Response = await request(app).post(`/api/v1/game/${gameId}/reset`)
      expect(res.statusCode).toBe(401)
    })

    it('post /reset with invalid gameId -> 400 Bad request', async () => {
      await request(app).post('/api/v1/game/3535345/reset').set('Authorization', `Bearer ${accessToken}`).expect(400)
    })
  })

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
    if (mongoServer) {
      await mongoServer.stop()
    }
  })
})