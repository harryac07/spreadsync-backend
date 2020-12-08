import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import { /* Request, Response,  */Application } from "express";
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import routes from './routes/';

const app: Application = express();
import './middleware/passport';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(helmet());

app.use('/api', routes);

/*  future central logging */
// app.use((err: any, req: Request, res: Response) => {
//   console.log('here');
//   if (app.get('env') === 'development') {
//     console.log(`${req.method} - ${req.status} '${req.url}'`);
//   }
//   /* Later this part can be used for central logging */
//   res.status(err.status || 500).json({
//     user_id: req.locals ? req.locals.user.id : undefined,
//     url: req.url,
//     message: err.message || 'Invalid request',
//   });
// });


export default app;
