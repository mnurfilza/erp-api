import request from "supertest";
import { createApp } from "@src/app.js";

describe("list all supplier groups", () => {
  it("should check user is authorized", async () => {
    const app = await createApp();
    // send request to list all supplier groups
    const response = await request(app).get("/v1/supplier-groups");
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
    // send request to read supplier group
    const response = await request(app).get("/v1/supplier-groups").set("Authorization", `Bearer ${accessToken}`);

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
      name: "supplier Z",
    };
    await request(app).post("/v1/supplier-groups").send(data).set("Authorization", `Bearer ${accessToken}`);
    const data2 = {
      name: "supplier X",
    };
    await request(app).post("/v1/supplier-groups").send(data2).set("Authorization", `Bearer ${accessToken}`);

    const response = await request(app).get("/v1/supplier-groups").set("Authorization", `Bearer ${accessToken}`);
    // expected response status
    expect(response.statusCode).toEqual(200);
    // expected response body
    expect(response.body.data[0]._id).not.toBeNull();
    expect(response.body.data[0].name).toEqual(data.name);
    // expect(response.body.data[0].createdAt instanceof Date).toBeTruthy();
    // expect(response.body.data[0].createdBy_id).toBe(authResponse.body._id);

    expect(response.body.data[1]._id).not.toBeNull();
    expect(response.body.data[1].name).toEqual(data2.name);
    // expect(response.body.data[1].createdAt instanceof Date).toBeTruthy();
    // expect(response.body.data[1].createdBy_id).toBe(authResponse.body._id);

    expect(response.body.pagination.page).toEqual(1);
    expect(response.body.pagination.pageCount).toEqual(1);
    expect(response.body.pagination.pageSize).toEqual(10);
    expect(response.body.pagination.totalDocument).toEqual(response.body.data.length);
  }, 10000);
});

describe("read supplier group", () => {
  it("should check user is authorized", async () => {
    const app = await createApp();
    // send request to list all suppliers
    const response = await request(app).get("/v1/supplier-groups");
    expect(response.statusCode).toEqual(401);
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
    // send request to read supplier group
    const response = await request(app).get("/v1/supplier-groups").set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toEqual(403);
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
      name: "Group H",
    };
    const responseCreate = await request(app)
      .post("/v1/supplier-groups")
      .send(data)
      .set("Authorization", `Bearer ${accessToken}`);
    const response = await request(app)
      .get("/v1/supplier-groups/" + responseCreate.body._id)
      .set("Authorization", `Bearer ${accessToken}`);
    // expected response status
    expect(response.statusCode).toEqual(200);
    // expected response body
    expect(response.body.data._id).not.toBeNull();
    expect(response.body.data.name).toEqual(data.name);
  });
});
