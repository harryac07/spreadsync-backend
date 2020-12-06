const supertest = require('supertest');
const passport = require('passport');
const app = require('../../server');
const Account = require('../../models/accounts');
const User = require('../../models/users');
const util = require('../../util/');
const GoogleApi = require('../../util/googleAuth');
const db = require('../../models/db');

const request = supertest(app);

jest.mock('../../util/');
jest.mock('passport');
jest.mock('../../util/googleAuth');
jest.mock('../../models/users');
jest.mock('../../models/accounts');

const signupPayload = {
  account_name: 'test account',
  firstname: 'test',
  lastname: 'test lastname',
  email: 'test@example.com',
  password: 'SpreadsyncPwd!',
};

afterAll(async (done) => {
  await db.destroy();
  done();
});

beforeEach(() => {
  passport.authenticate = jest.fn((authType, options, callback) => () => {
    callback(null, true);
  });
  console.error = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Auth endpoints', () => {
  it('should successfully create account with username password method', async () => {
    User.getUserByEmail.mockReturnValue([]);
    User.createUser.mockReturnValue([{ ...signupPayload, id: 12345 }]);
    User.hashPassword.mockReturnValue('has_password123');
    Account.createAccount.mockReturnValue([{ id: 123 }]);
    util.sendEmailConfirmationEmail = jest.fn();

    const response = await request.post('/api/auth/signup').send(signupPayload);
    expect(response.status).toBe(201);
    expect(User.getUserByEmail).toHaveBeenCalledWith(signupPayload.email);
    expect(User.hashPassword).toHaveBeenCalledWith(signupPayload.password);
  });

  it('should successfully login with correct username and password', async () => {
    const reqPayload = {
      id: 1,
      email: 'test@example.com',
      password: 'tester123',
      is_active: true,
    };
    User.getUserByEmail.mockReturnValue([reqPayload]);
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
    User.getUserByEmail.mockReturnValue([]);
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
    User.getUserByEmail.mockReturnValue([reqPayload]);
    User.isValidPassword = jest.fn().mockReturnValueOnce(false);
    User.trackUserAuthToken = jest.fn();
    const response = await request.post('/api/auth/login').send(reqPayload);
    expect(User.getUserByEmail).toHaveBeenCalledWith(reqPayload.email);
    expect(response.status).toBe(500);
    expect(response.body.message).toEqual('Password incorrect!');
  });

  it('should signup successfully with google auth', async () => {
    const authCode = 'tester123456789';
    User.getUserByEmail = jest.fn().mockReturnValueOnce([]);
    User.createUser = jest
      .fn()
      .mockReturnValueOnce([{ id: 1, is_active: true }]);
    Account.createAccount = jest.fn().mockReturnValueOnce([]);
    User.trackUserAuthToken = jest.fn();
    util.sendEmailConfirmationEmail = jest.fn();

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
