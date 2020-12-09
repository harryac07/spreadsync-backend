import supertest from 'supertest';
import app from '../../server';
import Project from '../../models/projects';
import User from '../../models/users';
import * as projectCtrl from '../../controllers/projects';
import { Project as ProjectTypes } from 'src/types';

jest.mock('../../util/');
jest.mock('../../models/db');
jest.mock('knex');

const request = supertest(app);

const projectMockPayload: Array<ProjectTypes & { accountName: string; }> = [
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
  spy.mockResolvedValue([
    {
      id: 'test-user-1234',
      email: 'test@test.com',
      password: 'testPwd',
      firstname: 'test',
      lastname: 'testa',
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

afterAll(async (done) => {
  bearerToken = '';
  done();
});

beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Project Endpoints', () => {
  it('should list all projects', async () => {
    const spy = jest.spyOn(Project, 'getAllProjectsWithOtherRelations');
    spy.mockResolvedValue(projectMockPayload);
    const response = await request
      .get('/api/projects')
      .set('Authorization', bearerToken)
      .set('account_id', '4b36afc8-5205-49c1-af16-4dc6f96db782');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(projectMockPayload);
    expect(response.body).toHaveLength(2);
  });
  it('should fail listing all projects if no accountId is passed in req headers', async () => {
    const spy = jest.spyOn(Project, 'getAllProjectsWithOtherRelations');
    spy.mockResolvedValue(projectMockPayload);
    const response = await request
      .get('/api/projects')
      .set('Authorization', bearerToken);
    // .set('account_id', '4b36afc8-5205-49c1-af16-4dc6f96db782');
    expect(response.status).toBe(500);
    expect(response.body.message).toBeTruthy();
  });
  it('should retrieve each project by id', async () => {
    const spy = jest.spyOn(Project, 'getProjectById');
    spy.mockResolvedValue([projectMockPayload[0]]);
    const response = await request
      .get(`/api/projects/${projectMockPayload[0].id}`)
      .set('Authorization', bearerToken);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([projectMockPayload[0]]);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual(projectMockPayload[0].id);
  });
  it('should create a project', async () => {
    const projectData = {
      name: 'test',
      description: 'Description',
    };
    const createPayload = {
      projectPayload: projectData,
      invitedUsers: ['test@test.com'],
    };

    const inviteUserToProjectSpy = jest.spyOn(projectCtrl, '_inviteUserToProject').mockResolvedValue();

    const spy = jest.spyOn(Project, 'createProject')
      .mockResolvedValueOnce([
        {
          ...projectData,
          id: '4b36afc8-5205-49c1-af26-test',
          admin: '4b36afc8-5205-49c1-af16-admin',
          account: '4b36afc8-5205-49c1-af16-account',
          created_on: '2020-05-24T09:53:55.632Z',
        },
      ]);

    const response = await request
      .post(`/api/projects/`)
      .set('Authorization', bearerToken)
      .set('account_id', '4b36afc8-5205-49c1-af16-4dc6f96db782')
      .send(createPayload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual('4b36afc8-5205-49c1-af26-test');
    expect(response.body[0].description).toEqual('Description');
    expect(response.body[0].name).toEqual('test');
    expect(response.body[0].admin).toBeTruthy();
    expect(response.body[0].account).toBeTruthy();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(inviteUserToProjectSpy).toHaveBeenCalledTimes(1);
  });
});
