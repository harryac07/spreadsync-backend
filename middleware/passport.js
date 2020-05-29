const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const moment = require('moment');

const db = require('../models/db');
const { User, Account } = require('../models');

//Create a passport middleware to handle user registration
passport.use(
  'signup',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        // check if user already exists
        const userRes = await User.getUserByEmail(email);
        if (userRes.length > 0) {
          return done(null, false, { message: 'User exists already!' });
        }
        const payload = req.body;
        const { account_name } = payload;

        // hash the provided password
        const hashPassword = await User.hashPassword(password);

        let user = [];
        await db.transaction(async function (trx) {
          // create user
          delete payload.account_name;
          user = await User.createUser(
            {
              ...payload,
              password: hashPassword,
            },
            trx,
          );
          // create Account
          if (account_name) {
            await Account.createAccount(
              {
                name: account_name,
                admin: user[0].id,
              },
              trx,
            );
          }
        });

        // Send the user information to the next middleware
        return done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);

//Create a passport middleware to handle User login
passport.use(
  'login',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        //Find the user associated with the email provided by the user
        const userRes = await User.getUserByEmail(email);
        const user = userRes[0];
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        const validate = await User.isValidPassword(email, password);
        if (!validate) {
          return done(null, false, { message: 'Wrong Password' });
        }

        const body = {
          id: user.id,
          email: user.email,
        };
        const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
          expiresIn: '12h',
        });

        /* track new token */
        const authTokenPayload = {
          user_id: user.id,
          last_logged_in: moment().format('YYYY-MM-DD HH:mm:ss'),
          token: token,
          is_token_valid: true,
        };
        await User.trackUserAuthToken(authTokenPayload);

        return done(null, token, { message: 'Logged in Successfully!' });
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// This verifies that the token sent by the user is valid
passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
