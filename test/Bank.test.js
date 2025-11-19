
const request = require("supertest");
const app = require("../Bank"); 
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Banking API", () => {
  let token;
  let userId1, userId2;

  beforeAll(async () => {

    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        fullname: "Test User",
        email: "test1@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
    userId1 = res.body.user.id;
  });

  test("Login user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test1@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  test("Send money to another account", async () => {
    // Create second user
    const resUser2 = await request(app)
      .post("/api/auth/register")
      .send({
        fullname: "Receiver User",
        email: "test2@example.com",
        password: "password123"
      });
    userId2 = resUser2.body.user.id;

    const res = await request(app)
      .post("/api/transfer")
      .set("Authorization", `Bearer ${token}`)
      .send({
        toUserId: userId2,
        amount: 50
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("transaction");
    expect(res.body.transaction.amount).toBe(50);
  });

  test("Fetch user transactions", async () => {
    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
  });
});
