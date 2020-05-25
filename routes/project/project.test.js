const supertest = require('supertest');
const app = require('../../server');
const Project = require('../../models/projects');
const auth = require('../../middlewares');

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

afterEach(() => {
  jest.clearAllMocks();
});

describe('Project Endpoints', () => {
  it('should list all projects', async () => {
    const spy = jest.spyOn(Project, 'getAllProjectsWithOtherRelations');
    spy.mockReturnValue(projectMockPayload);
    const response = await request.get('/api/projects');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(projectMockPayload);
    expect(response.body).toHaveLength(2);
  });

  it('should retrieve each project by id', async () => {
    const spy = jest.spyOn(Project, 'getProjectById');
    spy.mockReturnValue([projectMockPayload[0]]);
    const response = await request.get(
      `/api/projects/${projectMockPayload[0].id}`,
    );
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
    const response = await request.post(`/api/projects/`).send(createPayload);
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
