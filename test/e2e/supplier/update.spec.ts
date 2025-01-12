import exp from "constants";
import request from "supertest";
import { createApp } from "@src/app.js";
import { db } from "@src/database/database.js";

describe("update supplier", () => {
  let _id = "";
  beforeAll(async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to create supplier
    const data = {
      code: "CS5",
      name: "John Doe5",
      email: "johndoe@example.com",
      address: "21 Street",
      phone: "08123456789",
    };
    const response = await request(app).post("/v1/suppliers").send(data).set("Authorization", `Bearer ${accessToken}`);
    _id = response.body._id;
  });
  it("should check user is authorized", async () => {
    const app = await createApp();
    // send request to create supplier
    const response = await request(app)
      .patch("/v1/suppliers/" + _id)
      .send({});
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
    // send request to create supplier
    const response = await request(app)
      .patch("/v1/suppliers/" + _id)
      .send({})
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toEqual(403);
    expect(response.body.code).toBe(403);
    expect(response.body.status).toBe("Forbidden");
    expect(response.body.message).toBe("Don't have necessary permissions for this resource.");
  });
  it("should check required fields", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });
    // send request to create supplier
    const accessToken = authResponse.body.accessToken;

    // do not send all required fields
    const response = await request(app)
      .patch("/v1/suppliers/" + _id)
      .send({})
      .set("Authorization", `Bearer ${accessToken}`);
    expect(response.statusCode).toEqual(422);
    expect(response.body.message).toBe(
      "The request was well-formed but was unable to be followed due to semantic errors."
    );
    expect(response.body.status).toBe("Unprocessable Entity");
    expect(response.body.errors.name).toEqual(["The name field is required."]);
  });
  // it("should check unique fields", async () => {
  //   const app = await createApp();
  //   // get access token for authorization request
  //   const authResponse = await request(app).post("/v1/auth/signin").send({
  //     username: "admin",
  //     password: "admin123",
  //   });
  //   const accessToken = authResponse.body.accessToken;
  //   // send request to create supplier
  //   const data = {
  //     code: "CS5",
  //     name: "John Doe5",
  //     email: "johndoe@example.com",
  //     address: "21 Street",
  //     phone: "08123456789",
  //     isArchived: false,
  //   };

  //   const response = await request(app)
  //     .patch("/v1/suppliers/" + _id)
  //     .send(data)
  //     .set("Authorization", `Bearer ${accessToken}`);

  //   console.log(response.body);
  //   expect(response.statusCode).toEqual(422);
  //   expect(response.body.code).toBe(422);
  //   expect(response.body.status).toBe("Unprocessable Entity");
  //   expect(response.body.message).toBe(
  //     "The request was well-formed but was unable to be followed due to semantic errors."
  //   );
  //   expect(response.body.errors.code).toBe(["code is exists"]);
  //   expect(response.body.errors.name).toBe(["name is exists"]);
  // });
  it("should save to database", async () => {
    const app = await createApp();
    // get access token for authorization request
    const authResponse = await request(app).post("/v1/auth/signin").send({
      username: "admin",
      password: "admin123",
    });
    const accessToken = authResponse.body.accessToken;
    // send request to create supplier
    const data = {
      name: "supplier AAA",
    };
    const response = await request(app)
      .patch("/v1/suppliers/" + _id)
      .send(data)
      .set("Authorization", `Bearer ${accessToken}`);
    // expected response status
    expect(response.statusCode).toEqual(204);
    // expected database data by user input
    const responseGet = await request(app)
      .get("/v1/suppliers/" + _id)
      .set("Authorization", `Bearer ${accessToken}`);

    // expected response status
    expect(responseGet.statusCode).toEqual(200);
    // expected response body
    expect(responseGet.body.data.name).toEqual(data.name);
    // expected database data generated by system
    expect(responseGet.body.data.updatedBy_id).not.toBeNull();
  });
});
