import request from 'supertest'
import { app } from '../src/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User } from '@user/user.model'

describe('User', () => {

  let mongoServer: MongoMemoryServer
  let token: string
  let userId: string
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  const newUser: User = { 
    email: 'user@test.com',
    password: '123456',
    userName: 'test'
  }

  const { userName, ...loginUser } = newUser

  describe('User routes', () => {
    it('/signup With email, password, userName -> 201 Created', async () => {
      await request(app).post('/api/v1/user/signup').send(newUser).expect(201)
    })
    it('/signup With duplicated credentials -> 409 Conflict', async () => {
      await request(app).post('/api/v1/user/signup').send(newUser).expect(409)
    })
    it('/signin With valid credentials -> 200 with accessToken in response', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signin').send(loginUser)
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
      token = res.body.accessToken
    })
    it('get / With valid authorization -> 200 with user info in response', async () => {
      const res:request.Response = await request(app).get('/api/v1/user/').set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('_id')
      userId = res.body._id
      expect(mongoose.isValidObjectId(userId)).toBeTruthy()
    })
    it('get / Without authorization -> 401 Unathorized', async () => {
      const res:request.Response = await request(app).get('/api/v1/user/')
      expect(res.statusCode).toBe(401)
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