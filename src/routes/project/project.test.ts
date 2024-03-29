import supertest from 'supertest';
import app from '../../server';
import Project from '../../models/projects';
import User from '../../models/users';
import * as projectCtrl from '../../controllers/projects';
import { Project as ProjectTypes } from 'src/types';
import cache from '../../util/nodeCache';

const request = supertest(app);

jest.mock('../../util/');
jest.mock('../../models/db');
jest.mock('knex');

const projectMockPayload: Array<ProjectTypes & { accountName: string; accountAdmin: string; total_members?: number; }> = [
  {
    id: '4b36afc8-5205-49c1-af26-4dc6f26db982',
    name: 'Test project',
    description: 'Spreadsync Test',
    admin: '4b36afc8-5205-49c1-af16-4dc6f96db982',
    account: '4b36afc8-5205-49c1-af16-4d76f96db982',
    created_on: '2020-05-13T18:53:36.631Z',
    updated_on: null,
    accountName: 'Test Account 1',
    accountAdmin: "33a02a32-e755-48c9-b454-33359df7ff0c",
    total_members: 1
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
    accountAdmin: "4b36afc8-5205-49c1-af16-4dc6f96db980",
    total_members: 2
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
  jest.spyOn(User, 'getPermissionForUserByAccountId').mockResolvedValue(
    [{
      id: '123',
      user: '',
      project: '',
      account: '4b36afc8-5205-49c1-af16-4dc6f96db782',
      project_role: '',
      project_permission: '',
    }]
  );
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
    expect(response.status).toBe(400);
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
  it('should prevent delete project if account_id is not provided in request header', async () => {
    const spy = jest.spyOn(Project, 'deleteProject');
    spy.mockResolvedValue(true);
    const response = await request
      .delete(`/api/projects/${projectMockPayload[0].id}`)
      .set('Authorization', bearerToken);
    expect(response.status).toBe(403);
  });
  it('should prevent delete project if user is not an account admin', async () => {
    const spy = jest.spyOn(Project, 'deleteProject');
    spy.mockResolvedValue(true);
    const response = await request
      .delete(`/api/projects/${projectMockPayload[0].id}`)
      .set('Authorization', bearerToken)
      .set('account_id', '4b36afc8-5205-49c1-af16-4d76f96db982');
    expect(response.status).toBe(403);
  });
  it('Should delete project if request is made by an account admin', async () => {
    jest.spyOn(cache, 'getOrSet')
      .mockResolvedValue(
        [{
          id: '123',
          user: '',
          project: '',
          account: '4b36afc8-5205-49c1-af16-4d76f96db982',
          project_role: '',
          project_permission: 'admin',
        }]
      );
    const spy = jest.spyOn(Project, 'deleteProject');
    spy.mockResolvedValue(true);
    const response = await request
      .delete(`/api/projects/${projectMockPayload[0].id}`)
      .set('Authorization', bearerToken)
      .set('account_id', '4b36afc8-5205-49c1-af16-4d76f96db982');
    expect(response.status).toBe(200);
  });
  it('Should prevent project update if request is made by normal user', async () => {
    const accountId = '4b36afc8-5205-49c1-af16-4d76f96db982';
    const mockProject = projectMockPayload?.filter(({ account }) => account === accountId);
    const requestPayload = {
      name: 'tester 1',
      description: 'tester 1 description',
    };
    jest.spyOn(cache, 'getOrSet')
      .mockResolvedValue(
        [{
          id: '123',
          user: '',
          project: mockProject[0].id,
          account: accountId,
          project_role: '',
          project_permission: 'project_read',
        }]
      );
    const spy = jest.spyOn(Project, 'updateProject');
    spy.mockResolvedValue(mockProject.map(each => {
      return {
        ...each,
        ...requestPayload
      }
    }));
    const response = await request
      .patch(`/api/projects/${mockProject[0].id}`)
      .set('Authorization', bearerToken)
      .set('account_id', '4b36afc8-5205-49c1-af16-4d76f96db982')
      .send(requestPayload);
    expect(response.status).toBe(403);
  });
  it('Should update project if request is made by an account admin', async () => {
    const accountId = '4b36afc8-5205-49c1-af16-4d76f96db982';
    const mockProject = projectMockPayload?.filter(({ account }) => account === accountId);
    const requestPayload = {
      name: 'tester 1',
      description: 'tester 1 description',
    };
    jest.spyOn(cache, 'getOrSet')
      .mockResolvedValue(
        [{
          id: '123',
          user: '',
          project: mockProject[0].id,
          account: accountId,
          project_role: '',
          project_permission: 'admin',
        }]
      );
    const spy = jest.spyOn(Project, 'updateProject');
    spy.mockResolvedValue(mockProject.map(each => {
      return {
        ...each,
        ...requestPayload
      }
    }));
    const response = await request
      .patch(`/api/projects/${mockProject[0].id}`)
      .set('Authorization', bearerToken)
      .set('account_id', '4b36afc8-5205-49c1-af16-4d76f96db982')
      .send(requestPayload);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body?.[0]?.id).toEqual(mockProject[0].id);
    expect(response.body?.[0]?.name).toEqual(requestPayload.name);
    expect(response.body?.[0]?.description).toEqual(requestPayload.description);
  });
});
