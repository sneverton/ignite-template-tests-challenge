import { hash } from "bcryptjs"
import request from "supertest"
import { Connection } from "typeorm"
import { v4 as uuid } from "uuid"

import { app } from "../../../../app"
import { createConnection } from "../../../../database"

let connection: Connection

describe("Authenticate User Controller", () => {
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

  it("should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@test.com",
        password: "admin"
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
  })

  it("should not be able to authenticate an non existent user", async () => {
    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "test@test.com",
        password: "test"
      })

      expect(response.status).toBe(401)
  })

  it("should not be able to authenticate with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@test.com",
        password: ""
      })

      expect(response.status).toBe(401)
  })
})
