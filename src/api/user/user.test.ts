import request from 'supertest'
import { app } from '@src/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User } from '@user/user.model'

describe('User', () => {

  let mongoServer: MongoMemoryServer
  let accessToken: string
  let refreshToken: string
  let refreshTokenCookie: string
  let userId: string

  const newUser: User = { 
    email: 'user@test.com',
    password: '123456',
    userName: 'test'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userName: _, ...loginUser } = newUser


  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })
  
  describe('User routes', () => {
    it('/signup With email, password, userName -> 201 Created', async () => {
      await request(app).post('/api/v1/user/signup').send(newUser).expect(201)
    })
    it('/signup With duplicated credentials -> 409 Conflict', async () => {
      await request(app).post('/api/v1/user/signup').send(newUser).expect(409)
    })
    it('/signin With invalid password -> 400 Bad request', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signin').send({...loginUser, password: '1234567'})
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toBe('Password incorrect')
    })
    it('/signin With not registered email -> 404 Not found', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signin').send({...loginUser, email: 'test2@gmail.com'})
      expect(res.statusCode).toBe(404)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toBe('User with email test2@gmail.com not found')
    })
    it('/signin With valid credentials -> 200 with accessToken in response', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signin').send(loginUser)
      refreshTokenCookie = res.header['set-cookie'][0]
      refreshToken = refreshTokenCookie.split(';')[0].split('=')[1]
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
      accessToken = res.body.accessToken
    })
    it('get / With valid authorization -> 200 with user info in response', async () => {
      const res:request.Response = await request(app).get('/api/v1/user/').set('Authorization', `Bearer ${accessToken}`)
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

  describe('Refresh tokens', () => {
    beforeEach(async () => {
      await new Promise<void>((res) => {
        setTimeout(() => {
          res()
        }, 1000)
      })
    })

    it('get /refresh with valid token -> 200 with accessToken in body and refreshToken in cookies', async () => {
      const res:request.Response = await request(app).get('/api/v1/user/refresh').set('Cookie', refreshTokenCookie)
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body.accessToken).not.toBe(accessToken)
      accessToken = res.body.accessToken
      refreshTokenCookie = res.header['set-cookie'][0]
      const newRefreshToken = refreshTokenCookie.split(';')[0].split('=')[1]
      expect(refreshToken).not.toBe(newRefreshToken)
      refreshToken = newRefreshToken
    })
  })

  describe('Validation middleware', () => {
    it('/signup with invalid email -> 400 Bad request', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signup').send({email: 'someText@', password: '123456', userName: 'test'})
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
    })
    it('/signup with password length < 6 -> 400 Bad request', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signup').send({email: 'someText@gmail.com', password: '123', userName: 'test'})
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
    })
    it('/signup without userName -> 400 Bad request', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signup').send({email: 'someText@gmail.com', password: '123456'})
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
    })
    it('/signup without email -> 400 Bad request', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signup').send({password: '123456', userName: 'test'})
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
    })
    it('/signup without password -> 400 Bad request', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signup').send({email: 'someText@gmail.com', userName: 'test'})
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
    })
    it('/signup with empty body -> 400 Bad request', async () => {
      const res:request.Response = await request(app).post('/api/v1/user/signup').send({})
      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('message')
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