require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// Notes Plugin
const notes = require('./api/notes');
const NotesService = require('./services/postgres/notesService');
const {NotesValidator} = require('./validator/notes');

// User Plugin
const users = require('./api/users');
const UsersService = require('./services/postgres/usersService');
const {UsersValidator} = require('./validator/users');

// Auth Plugin
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/authenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const {AuthenticationsValidator} = require('./validator/authentications');

const init = async () => {
  const notesService = new NotesService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
        Credentials: {
          id: artifacts.decoded.payload.id,
        },
    }),
  });

  server.auth.default('notesapp_jwt');

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
