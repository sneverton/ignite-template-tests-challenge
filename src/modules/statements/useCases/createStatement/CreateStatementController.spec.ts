import { hash } from "bcryptjs"
import request from "supertest"
import { Connection } from "typeorm"
import { v4 as uuid } from "uuid"

import { app } from "../../../../app"
import { createConnection } from "../../../../database"

let connection: Connection

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuid()
    const password = await hash("admin", 8)

    await connection.query(
      `INSERT INTO users(
        id,
        name,
        email,
        password,
        created_at,
        updated_at
      )
      VALUES (
        '${id}',
        'admin',
        'admin@test.com',
        '${password}',
        'now()',
        'now()'
      )`
    )
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to create a deposit statement", async () => {
    const responseSession = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@test.com",
        password: "admin"
      })

    const { token } = responseSession.body


    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: 'deposit'
      })
      .set({
        Authorization: `Bearer ${token}`
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
  })

  it("should be able to create a withdraw statement", async () => {
    const responseSession = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@test.com",
        password: "admin"
      })

    const { token } = responseSession.body


    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: 'withdraw'
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
  })

  it("should not be able to create a deposit statement when not authenticated", async () => {
    const response = await request(app)
      .get("/api/v1/statements/deposit")

    expect(response.status).toBe(401)
  })

  it("should not be able to create a withdraw statement when not authenticated", async () => {
    const response = await request(app)
      .get("/api/v1/statements/withdraw")

    expect(response.status).toBe(401)
  })

  it("should not be able to create a withdraw statement with insufficient funds", async () => {
    const responseSession = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@test.com",
        password: "admin"
      })

    const { token } = responseSession.body

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: 'withdraw'
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(response.status).toBe(400)
  })
})
