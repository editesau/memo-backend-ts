import request from 'supertest'
import { app } from '@src/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User, userModel } from '@user/user.model'
import { checkToken, createAccessToken } from '@src/services/jwt.service'

describe('User', () => {

  let mongoServer: MongoMemoryServer
  let userId: string

  const newUser: User = { 
    email: 'user@test.com',
    password: '123456',
    userName: 'test'
  }

  const existingUser: User = { 
    email: 'existing@test.com',
    password: '123456',
    userName: 'test2'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userName: _, ...loginUser } = newUser


  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    const result = await userModel.create(existingUser)
    userId = result.toJSON()._id.toString()
  })
  
  describe('Auth routes', () => {
    describe('Registartion', () => {
      test('/signup With email, password, userName -> 201 Created', async () => {
        return await request(app).post('/api/v1/user/signup').send(newUser).expect(201)
      })
      test('/signup With duplicated credentials -> 409 Conflict', async () => {
        await request(app).post('/api/v1/user/signup').send(existingUser).expect(409)
      })
      describe('Validation middleware', () => {
        test('/signup with invalid email -> 400 Bad request', async () => {
          const res:request.Response = await request(app).post('/api/v1/user/signup').send({email: 'someText@', password: '123456', userName: 'test'})
          expect(res.statusCode).toBe(400)
          expect(res.body).toHaveProperty('message')
        })
        test('/signup with password length < 6 -> 400 Bad request', async () => {
          const res:request.Response = await request(app).post('/api/v1/user/signup').send({email: 'someText@gmail.com', password: '123', userName: 'test'})
          expect(res.statusCode).toBe(400)
          expect(res.body).toHaveProperty('message')
        })
        test('/signup without userName -> 400 Bad request', async () => {
          const res:request.Response = await request(app).post('/api/v1/user/signup').send({email: 'someText@gmail.com', password: '123456'})
          expect(res.statusCode).toBe(400)
          expect(res.body).toHaveProperty('message')
        })
        test('/signup without email -> 400 Bad request', async () => {
          const res:request.Response = await request(app).post('/api/v1/user/signup').send({password: '123456', userName: 'test'})
          expect(res.statusCode).toBe(400)
          expect(res.body).toHaveProperty('message')
        })
        test('/signup without password -> 400 Bad request', async () => {
          const res:request.Response = await request(app).post('/api/v1/user/signup').send({email: 'someText@gmail.com', userName: 'test'})
          expect(res.statusCode).toBe(400)
          expect(res.body).toHaveProperty('message')
        })
        test('/signup with empty body -> 400 Bad request', async () => {
          const res:request.Response = await request(app).post('/api/v1/user/signup').send({})
          expect(res.statusCode).toBe(400)
          expect(res.body).toHaveProperty('message')
        })
      })
    })

    describe('Authorization', () => {
      test('/signin With valid credentials -> 200 with accessToken in response', async () => {
        const res:request.Response = await request(app).post('/api/v1/user/signin').send(loginUser)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('accessToken')
        expect(checkToken(res.body.accessToken)).toHaveProperty('userId')
      })
      test('/signin With invalid password -> 401 Unauthorized', async () => {
        const res:request.Response = await request(app).post('/api/v1/user/signin').send({...loginUser, password: '1234567'})
        expect(res.statusCode).toBe(401)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('Password incorrect')
      })
      test('/signin With not registered email -> 404 Not found', async () => {
        const res:request.Response = await request(app).post('/api/v1/user/signin').send({...loginUser, email: 'test2@gmail.com'})
        expect(res.statusCode).toBe(404)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toBe('User with email test2@gmail.com not found')
      })
      test('get / With valid authorization -> 200 with user info in response', async () => {
        const accessToken = createAccessToken({userId})
        const res:request.Response = await request(app).get('/api/v1/user/').set('Authorization', `Bearer ${accessToken}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('_id')
        userId = res.body._id
        expect(mongoose.isValidObjectId(userId)).toBeTruthy()
      })
      test('get / Without authorization -> 401 Unathorized', async () => {
        const res:request.Response = await request(app).get('/api/v1/user/')
        expect(res.statusCode).toBe(401)
      })
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