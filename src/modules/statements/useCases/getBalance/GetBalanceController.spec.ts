import { hash } from "bcryptjs"
import request from "supertest"
import { Connection } from "typeorm"
import { v4 as uuid } from "uuid"

import { app } from "../../../../app"
import { createConnection } from "../../../../database"

let connection: Connection

describe("Get Balance Controller", () => {
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

  it("should be able to show a user balance", async () => {
    const responseSession = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@test.com",
        password: "admin"
      })

    const { token } = responseSession.body


    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("balance")
  })

  it("should not be able to show a balance of non existing user", async () => {
    const response = await request(app)
    .get("/api/v1/statements/balance")

    expect(response.status).toBe(401)
  })
})
