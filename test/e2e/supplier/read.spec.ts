import request from "supertest";
import { createApp } from "@src/app.js";

describe("list all suppliers", () => {
  beforeAll(async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to create supplier

    // create data
    const data = {
      code: "CS9",
      name: "John Doe9",
      email: "johndoe@example.com",
      address: "21 Street",
      phone: "08123456789",
    };
    const resp1 = await request(app).post("/v1/suppliers").send(data).set("Authorization", `Bearer ${accessToken}`);
    const data2 = {
      code: "CS2",
      name: "John Doe2",
      email: "johndoe2@example.com",
      address: "21 Street",
      phone: "08123456789",
    };
    const resp2 = await request(app).post("/v1/suppliers").send(data2).set("Authorization", `Bearer ${accessToken}`);
  }, 10000);
  it("should check user is authorized", async () => {
    const app = await createApp();
    // send request to create supplier
    const response = await request(app).get("/v1/suppliers");
    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toBe("Authentication credentials is invalid.");
  });
  it("should check user have permission to access", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "user",
      password: "admin123",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to read supplier
    const response = await request(app).get("/v1/suppliers").set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toEqual(403);
    expect(response.body.code).toBe(403);
    expect(response.body.status).toBe("Forbidden");
    expect(response.body.message).toBe("Don't have necessary permissions for this resource.");
  });
  it("should read data from database", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });
    const accessToken = authResponse.body.accessToken;
    const data = {
      code: "CS9",
      name: "John Doe9",
      email: "johndoe@example.com",
      address: "21 Street",
      phone: "08123456789",
    };
    const data2 = {
      code: "CS2",
      name: "John Doe2",
      email: "johndoe2@example.com",
      address: "21 Street",
      phone: "08123456789",
    };
    const response = await request(app).get("/v1/suppliers").set("Authorization", `Bearer ${accessToken}`);
    // expected response status
    expect(response.statusCode).toEqual(200);
    // expected response body
    expect(response.body.data[0]._id).not.toBeNull();
    expect(response.body.data[0].code).toEqual(data.code);
    expect(response.body.data[0].name).toEqual(data.name);
    expect(response.body.data[0].email).toEqual(data.email);
    expect(response.body.data[0].address).toEqual(data.address);
    expect(response.body.data[0].phone).toEqual(data.phone);
    // expect(response.body.data[0].createdAt instanceof Date).toBeTruthy();
    // expect(response.body.data[0].createdBy_id).toBe(authResponse.body._id);

    expect(response.body.data[1]._id).not.toBeNull();
    expect(response.body.data[1].code).toEqual(data2.code);
    expect(response.body.data[1].name).toEqual(data2.name);
    expect(response.body.data[1].email).toEqual(data2.email);
    expect(response.body.data[1].address).toEqual(data2.address);
    expect(response.body.data[1].phone).toEqual(data2.phone);
    // expect(response.body.data[1].createdAt instanceof Date).toBeTruthy();
    // expect(response.body.data[1].createdBy_id).toBe(authResponse.body._id);

    expect(response.body.pagination.page).toEqual(1);
    expect(response.body.pagination.pageCount).toEqual(1);
    expect(response.body.pagination.pageSize).toEqual(10);
    expect(response.body.pagination.totalDocument).toEqual(2);
  });
});

describe("read supplier", () => {
  it("should check user is authorized", async () => {
    const app = await createApp();
    // send request to create supplier
    const response = await request(app).get("/v1/suppliers/1");
    expect(response.statusCode).toEqual(401);
    expect(response.body.code).toBe(401);
    expect(response.body.status).toBe("Unauthorized");
    expect(response.body.message).toBe("Authentication credentials is invalid.");
  });
  it("should check user have permission to access", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "user",
      password: "admin123",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to read supplier
    const response = await request(app).get("/v1/suppliers/1").set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toEqual(403);
    expect(response.body.code).toBe(403);
    expect(response.body.status).toBe("Forbidden");
    expect(response.body.message).toBe("Don't have necessary permissions for this resource.");
  });
  it("should read data from database", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });
    const accessToken = authResponse.body.accessToken;

    // create data
    const data = {
      code: "CS3",
      name: "John Doe3",
      email: "johndoe@example.com",
      address: "21 Street",
      phone: "08123456789",
    };
    const responseCreate = await request(app)
      .post("/v1/suppliers")
      .send(data)
      .set("Authorization", `Bearer ${accessToken}`);

    const response = await request(app)
      .get("/v1/suppliers/" + responseCreate.body._id)
      .set("Authorization", `Bearer ${accessToken}`);
    // expected response status
    expect(response.statusCode).toEqual(200);
    // expected response body
    expect(response.body.data._id).not.toBeNull();
    expect(response.body.data.code).toEqual(data.code);
    expect(response.body.data.name).toEqual(data.name);
    expect(response.body.data.email).toEqual(data.email);
    expect(response.body.data.address).toEqual(data.address);
    expect(response.body.data.phone).toEqual(data.phone);
    // expect(response.body.data.createdBy_id).toBe(authResponse.body._id);
  }, 7000);
});
