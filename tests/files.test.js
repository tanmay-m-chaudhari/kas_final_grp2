const request = require("supertest");
const app = require("../src/index");
const path = require("path");

let token;

beforeAll(async () => {
  await request(app).post("/api/auth/register").send({ username: "testuser", password: "securepassword" });
  const res = await request(app).post("/api/auth/login").send({ username: "testuser", password: "securepassword" });
  token = res.body.data.token;
});

test("GET /health returns ok", async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
  expect(res.body.status).toBe("ok");
});

test("GET /api/files without auth returns 401", async () => {
  const res = await request(app).get("/api/files");
  expect(res.status).toBe(401);
});

test("GET /api/files with auth returns paginated list", async () => {
  const res = await request(app).get("/api/files").set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(res.body.data).toHaveProperty("items");
});
