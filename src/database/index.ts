import { createConnection as createTypeORMConnection, getConnectionOptions } from "typeorm";


async function createConnection() {
  const defaultOptions = await getConnectionOptions()

  return await createTypeORMConnection(Object.assign(defaultOptions, {
    database:
      process.env.NODE_ENV === "test"
        ? "fin_api_test"
        : defaultOptions.database
  }))
}

createConnection()

export { createConnection }
