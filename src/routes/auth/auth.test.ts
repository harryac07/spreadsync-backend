import supertest from 'supertest';
import passport from 'passport';
import app from '../../server';
import User from '../../models/users';
import GoogleApi from '../../util/googleAuth';
import * as authCtrl from '../../controllers/auth/index';
import { UserType } from 'src/types';

const request = supertest(app);

jest.mock('../../util/');
jest.mock('passport');
jest.mock('../../util/googleAuth');
jest.mock('../../models/users');
jest.mock('../../models/accounts');
jest.mock('../../models/db');
jest.mock('knex');

const signupPayload = {
  account_name: 'test account',
  firstname: 'test',
  lastname: 'test lastname',
  email: 'test@example.com',
  password: 'SpreadsyncPwd!',
};

const createUserAndAccountPayload: UserType[] = [{
  id: '12345',
  email: signupPayload.email,
  is_active: true,
  firstname: signupPayload.firstname,
  lastname: signupPayload.lastname
}]

beforeEach(() => {
  (passport.authenticate as jest.Mock) = jest.fn((authType, options, callback) => () => {
    callback(null, true);
  });
  console.error = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Auth endpoints', () => {
  it('should successfully create account with username password method', async () => {
    jest.spyOn(authCtrl, '_createUserAndAccount').mockResolvedValue(createUserAndAccountPayload);
    (User.getUserByEmail as jest.Mock).mockResolvedValue([]);

    const response = await request.post('/api/auth/signup').send(signupPayload);
    expect(response.status).toBe(201);
    expect(User.getUserByEmail).toHaveBeenCalledWith(signupPayload.email);
  });

  it('should successfully login with correct username and password', async () => {
    const reqPayload = {
      id: 1,
      email: 'test@example.com',
      password: 'tester123',
      is_active: true,
    };
    (User.getUserByEmail as jest.Mock).mockReturnValue([reqPayload]);
    User.trackUserAuthToken = jest.fn();
    User.isValidPassword = jest.fn().mockReturnValueOnce(true);
    const response = await request.post('/api/auth/login').send(reqPayload);
    expect(User.isValidPassword).toHaveBeenCalledWith(
      reqPayload.email,
      reqPayload.password,
    );
    expect(User.getUserByEmail).toHaveBeenCalledWith(reqPayload.email);
    expect(response.status).toBe(200);
  });

  it('should fail login when email not found', async () => {
    const reqPayload = {
      id: 1,
      email: 'test@example.com',
      password: 'tester123',
      is_active: true,
    };
    (User.getUserByEmail as jest.Mock).mockReturnValue([]);
    User.trackUserAuthToken = jest.fn();
    const response = await request.post('/api/auth/login').send(reqPayload);
    expect(User.getUserByEmail).toHaveBeenCalledWith(reqPayload.email);
    expect(response.status).toBe(500);
    expect(response.body.message).toEqual(
      'User not found. Provide valid email!',
    );
  });

  it('should fail login when wrong password is provided', async () => {
    const reqPayload = {
      id: 1,
      email: 'test@example.com',
      password: 'tester123',
      is_active: true,
    };
    (User.getUserByEmail as jest.Mock).mockReturnValue([reqPayload]);
    User.isValidPassword = jest.fn().mockReturnValueOnce(false);
    User.trackUserAuthToken = jest.fn();
    const response = await request.post('/api/auth/login').send(reqPayload);
    expect(User.getUserByEmail).toHaveBeenCalledWith(reqPayload.email);
    expect(response.status).toBe(500);
    expect(response.body.message).toEqual('Password incorrect!');
  });

  it('should signup successfully with google auth', async () => {
    const authCode = 'tester123456789';
    jest.spyOn(authCtrl, '_createUserAndAccount').mockResolvedValue(createUserAndAccountPayload);
    GoogleApi.prototype.getAccessToken = jest.fn().mockReturnValueOnce(
      Promise.resolve({
        token_id: '123455',
      }),
    );
    GoogleApi.prototype.getUserDetails = jest.fn().mockReturnValueOnce(
      Promise.resolve({
        email: 'test@example.com',
      }),
    );
    const reqPayload = {
      authCode: authCode,
      auth: 'google',
    };
    const response = await request
      .post('/api/auth/login/google')
      .send(reqPayload);
    expect(response.status).toBe(200);
  });
});
