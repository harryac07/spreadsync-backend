require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const routes = require('./routes');

const app = express();
require('./middleware/passport');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(helmet());

app.use('/api', routes);

app.use(function (err, req, res, next) {
  if (app.get('env') === 'development') {
    console.log(`${req.method} - ${req.status} '${req.url}'`);
  }
  /* Later this part can be used for central logging */
  res.status(err.status || 500).json({
    user_id: req.locals ? req.locals.user.user_id : undefined,
    url: req.url,
    message: err.message || 'Invalid request',
    // error: err.stack,
  });
});

module.exports = app;
