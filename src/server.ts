import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { /* Request, Response,  */Application } from "express";
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import routes from './routes/';

const app: Application = express();

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

import './middleware/passport';

app.use(Sentry.Handlers.requestHandler({
  user: ['id', 'username', 'email'],
  ip: true,
}));
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(helmet());

app.use('/api', routes);
// app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  console.error(err.stack);
  // Error logging to our Sentry
  Sentry.withScope((scope) => {
    scope.setUser({
      id: req.locals?.user?.id ?? '',
      email: req.locals?.user?.email ?? ''
    });
    scope.setTransactionName(req.method + ' ' + req.path)
    Sentry.captureException(err);
  });

  res.status(500).json({
    message: err.message || 'Invalid Request',
  });
});
export default app;
