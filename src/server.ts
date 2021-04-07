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


export default app;
