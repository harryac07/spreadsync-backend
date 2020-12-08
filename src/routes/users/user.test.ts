import supertest from 'supertest';
import app from '../../server';
import User from '../../models/users';


const request = supertest(app);

jest.mock('../../models/db');
jest.mock('knex');

const usersMockPayload = [
  {
    id: '4b36afc8-5205-49c1-af16-4dc6f96db982',
    email: 'harryac07@test.com',
    firstname: 'Hari',
    lastname: 'Adhikari',
    phone: '04498812801',
    created_on: '2020-04-12T09:32:29.241Z',
    updated_on: null,
  },
  {
    id: '4b36afc8-5205-49c1-af16-4dc6f96db980',
    email: 'sandeep.thapa@test.com',
    firstname: 'Sandeep',
    lastname: 'Thapa',
    phone: '1234567890',
    created_on: '2020-04-12T09:32:29.241Z',
    updated_on: null,
  },
];

let bearerToken = '';
beforeAll(async () => {
  const spy = jest.spyOn(User, 'getUserByEmail');
  spy.mockResolvedValue([
    {
      id: 'test-user-1234',
      email: 'test@test.com',
      password: 'testPwd',
      created_on: '2020-05-13T18:53:36.631Z',
      is_active: true,
    },
  ]);
  jest.spyOn(User, 'isValidPassword').mockResolvedValue(true);
  jest.spyOn(User, 'trackUserAuthToken').mockResolvedValue();
  const response = await request.post('/api/auth/login').send({
    email: 'test@test.com',
    password: 'testPwd',
  });
  bearerToken = `bearer ${response.body.token}`;
});

afterAll(() => {
  bearerToken = '';
});

beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Users Endpoints', () => {
  it('should list users', async () => {
    const spy = jest.spyOn(User, 'getAllUsers');
    spy.mockResolvedValue(usersMockPayload);
    const response = await request
      .get('/api/users')
      .set('Authorization', bearerToken);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(usersMockPayload);
    expect(response.body).toHaveLength(2);
  });
  it('should retrieve each user by id', async () => {
    const spy = jest.spyOn(User, 'getUserById');
    spy.mockResolvedValue([usersMockPayload[0]]);
    const response = await request
      .get(`/api/users/${usersMockPayload[0].id}`)
      .set('Authorization', bearerToken);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([usersMockPayload[0]]);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual(usersMockPayload[0].id);
  });
  it('should retrieve all accounts for user', async () => {
    const spy = jest.spyOn(User, 'getAllAccountsForUser');
    spy.mockResolvedValue([
      {
        id: '4b36afc8-5205-49c1-af16-test',
        name: 'Test Account 1',
        created_on: '2020-05-26T21:31:52.905Z',
        user: 'test-user-1234',
      },
      {
        id: '4b36afc8-5205-49c1-af16-test',
        name: 'Test Account 2',
        created_on: '2020-05-26T21:31:52.905Z',
        user: 'test-user-1234',
      },
    ]);
    const response = await request
      .get(`/api/users/${usersMockPayload[0].id}/accounts`)
      .set('Authorization', bearerToken);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].user).toEqual('test-user-1234');
  });
});
