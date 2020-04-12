const supertest = require("supertest");
const app = require("../../server");
const User = require("../../models/users");

const request = supertest(app);

const usersMockPayload = [
  {
    id: "4b36afc8-5205-49c1-af16-4dc6f96db982",
    email: "harryac07@test.com",
    firstname: "Hari",
    lastname: "Adhikari",
    phone: "04498812801",
    created_on: "2020-04-12T09:32:29.241Z",
    updated_on: null,
  },
  {
    id: "4b36afc8-5205-49c1-af16-4dc6f96db980",
    email: "sandeep.thapa@test.com",
    firstname: "Sandeep",
    lastname: "Thapa",
    phone: "1234567890",
    created_on: "2020-04-12T09:32:29.241Z",
    updated_on: null,
  },
];

afterEach(() => {
  jest.clearAllMocks();
});

describe("Users Endpoints", () => {
  it("should list users", async () => {
    const spy = jest.spyOn(User, "getAllUsers");
    spy.mockReturnValue(usersMockPayload);
    const response = await request.get("/api/users");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(usersMockPayload);
    expect(response.body).toHaveLength(2);
  });

  it("should retrieve each user by id", async () => {
    const spy = jest.spyOn(User, "getUserById");
    spy.mockReturnValue([usersMockPayload[0]]);
    const response = await request.get(`/api/users/${usersMockPayload[0].id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([usersMockPayload[0]]);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual(usersMockPayload[0].id);
  });
});
