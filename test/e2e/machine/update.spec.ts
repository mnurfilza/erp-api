import request from "supertest";
import { createApp } from "@src/app.js";

describe("update machine", () => {
  let _id = "";
  beforeEach(async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).patch("/v1/auth/signin").send({
      username: "admin",
      password: "admin2024",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to create machine
    const data = {
      name: "machine A",
    };
    const response = await request(app).post("/v1/machines").send(data).set("Authorization", `Bearer ${accessToken}`);
    _id = response.body._id;
  });
  it("should check user is authorized", async () => {
    const app = await createApp();
    // send request to create machine
    const response = await request(app)
      .patch("/v1/machines/" + _id)
      .send({});
    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toBe("Unauthorized Access");
  });
  it("should check user have permission to access", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "user",
      password: "user2024",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to create machine
    const response = await request(app)
      .patch("/v1/machines/" + _id)
      .send({})
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toEqual(403);
    expect(response.body.message).toBe("Forbidden Access");
  });
  it("should check required fields", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin2024",
    });
    // send request to create machine
    const accessToken = authResponse.body.accessToken;

    // do not send all required fields
    const response = await request(app)
      .patch("/v1/machines/" + _id)
      .send({})
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toEqual(422);
    expect(response.body.message).toBe("Unprocessable Entity");
    expect(response.body.errors.name).toBe(["name is required"]);

    // only send 1 required fields
    const response2 = await request(app)
      .patch("/v1/machines/" + _id)
      .send({
        name: "machine A",
      })
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response2.statusCode).toEqual(422);
    expect(response2.body.message).toBe("Unprocessable Entity");
  });
  it("should check unique fields", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin2024",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to create machine
    const data = {
      name: "machine A",
    };

    const response = await request(app)
      .patch("/v1/machines/" + _id)
      .send(data)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toEqual(422);
    expect(response.body.message).toBe("Unprocessable Entity");
    expect(response.body.errors.name).toBe(["name is exists"]);
  });
  it("should save to database", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).patch("/v1/auth/signin").send({
      username: "admin",
      password: "admin2024",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to create machine
    const data = {
      name: "machine AAA",
    };
    const response = await request(app)
      .patch("/v1/machines/" + _id)
      .send(data)
      .set("Authorization", `Bearer ${accessToken}`);
    // expected response status
    expect(response.statusCode).toEqual(204);
    // expected database data by user input
    const machineService = new AllocationService(db);
    const result = machineService.read(response.body._id);
    expect(result.name).toEqual("AAA");
    // expected database data generated by system
    expect(result.updatedAt instanceof Date).toBeTruthy();
    expect(result.updatedBy_id).toBe(authResponse.body._id);
  });
});
