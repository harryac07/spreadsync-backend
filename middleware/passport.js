const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const { User } = require('../models');

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

        // hash the provided password
        const hashPassword = await User.hashPassword(password);

        // create user
        const user = await User.createUser({
          ...payload,
          password: hashPassword,
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

        return done(null, user, { message: 'Logged in Successfully!' });
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
