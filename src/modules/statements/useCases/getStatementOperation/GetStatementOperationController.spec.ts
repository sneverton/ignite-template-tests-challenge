import { hash } from "bcryptjs"
import request from "supertest"
import { Connection } from "typeorm"
import { v4 as uuid } from "uuid"

import { app } from "../../../../app"
import { createConnection } from "../../../../database"

let connection: Connection

describe("Get Statement Operation Controller", () => {
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

  it("should be able to show a statement operation", async () => {
    const responseSession = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@test.com",
        password: "admin"
      })

    const { token } = responseSession.body


    const responseCreatedStatement = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: 'deposit'
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    const { id: statement_id } = responseCreatedStatement.body;

    const responseGetStatement = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(responseGetStatement.status).toBe(200)
    expect(responseGetStatement.body).toHaveProperty("id")
    expect(responseGetStatement.body).toHaveProperty("amount")
  })

  it("should not be able to show a statement operation when not authenticated", async () => {
    const statement_id = uuid();

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)

    expect(response.status).toBe(401)
  })

  it("should not be able to show a non existing statement operation", async () => {
    const responseSession = await request(app).post("/api/v1/sessions")
      .send({
        email: "admin@test.com",
        password: "admin"
      })

    const { token } = responseSession.body

    const statement_id = uuid();

    const responseGetStatement = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(responseGetStatement.status).toBe(404)
  })
})
