const supertest = require('supertest');
const passport = require('passport');
const app = require('../../server');
const Project = require('../../models/projects');
const Account = require('../../models/accounts');
const User = require('../../models/users');
const util = require('../../util/');
const db = require('../../models/db');

jest.mock('../../util/');
jest.mock('passport');

const request = supertest(app);

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

afterEach(() => {
  jest.clearAllMocks();
});

describe('Auth endpoints', () => {
  it('should successfully create account', async () => {
    const spy = jest.spyOn(User, 'getUserByEmail');
    spy.mockReturnValue([]);
    passport.authenticate = jest.fn((authType, options, callback) => () => {
      callback(null, true);
    });
    jest
      .spyOn(User, 'createUser')
      .mockReturnValue([{ ...signupPayload, id: 12345 }]);
    const hashPasswordSpy = jest
      .spyOn(User, 'hashPassword')
      .mockReturnValue('has_password123');
    jest.spyOn(Account, 'createAccount').mockReturnValue([{ id: 123 }]);

    util.sendEmailConfirmationEmail = jest.fn();

    const response = await request.post('/api/auth/signup').send(signupPayload);
    expect(response.status).toBe(201);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(signupPayload.email);
    expect(hashPasswordSpy).toHaveBeenCalledWith(signupPayload.password);
  });
});
