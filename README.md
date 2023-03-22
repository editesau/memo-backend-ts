
# Memorika backend TS

![Logo](https://user-images.githubusercontent.com/111222143/221550000-5a881d2e-4389-4077-b688-38867df88667.png)

Backend for SPA in Memo-games style
## Features
On v0.3.0 we have next features available:
- API for User actions Signin/SignUp/Logout/Change user info
- API for Game actions Start/Reset
- Main game loop working with Socket.io connection, all logic controlled by backend
- Use typescript for develop


## Tech Stack

Typescript, Node.js, Express, Socket.io, Zod, MongoDB, Jest

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file of backend

`MONGO_HOST` DNS or IP MongoDB 

`MONGO_PORT` MongoDB port

`MONGO_CA_PATH` **Full** path to MongoDB CA certificate

`MONGO_CLIENT_CRT_PATH` **Full** path to MongoDB client auth certificate

`APP_PORT` Express application port

`API_VERSION` API version, used in endpoints

`JWT_SECRET` Sign secret for JWT tokens

`JWT_ACCESS_LIFE` Access token lifetime in seconds

`JWT_REFRESH_LIFE` Refresh token lifetime in seconds

`BCRYPT_SALT` Salt value for BCRYPT password crypting

`MORGAN_ENV` Env value for morgan logger

`CORS_ORIGIN` CORS value

`SOCKET_PATH` Socket.io path


## API Reference

Api reference described [here](https://app.swaggerhub.com/apis-docs/ALEXEYPO121/sb-memo/0.3.0)


## Deployment

To run this project you need a [secured mongoDB](https://www.mongodb.com/docs/manual/tutorial/configure-x509-client-authentication/) instance, and set .env described in Environment variables section, then:

### CMD
```bash
  npm i
  npm run dev
```


## Authors

- [@editesau](https://github.com/editesau) Aleksei Morozov

