const supertest = require('supertest');
const app = require('../../server');
const Project = require('../../models/projects');
const User = require('../../models/users');

const request = supertest(app);

const projectMockPayload = [
  {
    id: '4b36afc8-5205-49c1-af26-4dc6f26db982',
    name: 'Test project',
    description: 'Spreadsync Test',
    admin: '4b36afc8-5205-49c1-af16-4dc6f96db982',
    account: '4b36afc8-5205-49c1-af16-4d76f96db982',
    created_on: '2020-05-13T18:53:36.631Z',
    updated_on: null,
    accountName: 'Test Account 1',
  },
  {
    id: '4b36afc8-5205-49c1-af26-4dc6f27db982',
    name: 'Test project 1',
    description: 'Export SS',
    admin: '4b36afc8-5205-49c1-af16-4dc6f96db980',
    account: '4b36afc8-5205-49c1-af16-4dc6f96db782',
    created_on: '2020-05-13T18:53:36.631Z',
    updated_on: null,
    accountName: 'Test Account 2',
  },
];

let bearerToken = '';
beforeAll(async () => {
  const spy = jest.spyOn(User, 'getUserByEmail');
  spy.mockReturnValue([
    {
      id: 'test-user-1234',
      email: 'test@test.com',
      password: 'testPwd',
      account: 'test-account-1111',
      created_on: '2020-05-13T18:53:36.631Z',
    },
  ]);
  jest.spyOn(User, 'isValidPassword').mockReturnValue(true);
  const response = await request.post('/api/auth/login').send({
    email: 'test@test.com',
    password: 'testPwd',
  });
  bearerToken = `bearer ${response.body.token}`;
});

afterAll(() => {
  bearerToken = '';
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Project Endpoints', () => {
  it('should list all projects', async () => {
    const spy = jest.spyOn(Project, 'getAllProjectsWithOtherRelations');
    spy.mockReturnValue(projectMockPayload);
    const response = await request
      .get('/api/projects')
      .set('Authorization', bearerToken);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(projectMockPayload);
    expect(response.body).toHaveLength(2);
  });
  it('should retrieve each project by id', async () => {
    const spy = jest.spyOn(Project, 'getProjectById');
    spy.mockReturnValue([projectMockPayload[0]]);
    const response = await request
      .get(`/api/projects/${projectMockPayload[0].id}`)
      .set('Authorization', bearerToken);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([projectMockPayload[0]]);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual(projectMockPayload[0].id);
  });
  it('should create a project', async () => {
    const projectData = { name: 'test', description: 'Description' };
    const createPayload = {
      projectPayload: projectData,
      invitedUsers: ['test@test.com'],
    };
    const spy = jest.spyOn(Project, 'createProject');
    spy.mockReturnValue([
      {
        ...projectData,
        id: '4b36afc8-5205-49c1-af26-test',
        admin: '4b36afc8-5205-49c1-af16-admin',
        account: '4b36afc8-5205-49c1-af16-account',
        created_on: '2020-05-24T09:53:55.632Z',
        accountName: 'Test Account',
      },
    ]);
    const response = await request
      .post(`/api/projects/`)
      .set('Authorization', bearerToken)
      .send(createPayload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual('4b36afc8-5205-49c1-af26-test');
    expect(response.body[0].description).toEqual('Description');
    expect(response.body[0].name).toEqual('test');
    expect(response.body[0].admin).toBeTruthy();
    expect(response.body[0].account).toBeTruthy();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
