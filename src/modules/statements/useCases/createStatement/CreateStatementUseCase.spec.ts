import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { OperationType } from "../../entities/Statement";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { CreateStatementError } from "./CreateStatementError";


describe("Create Statement Use Case", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })


  it("should be able to create a statement", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    const createdUser = await createUserUseCase.execute(user);

    const statement: ICreateStatementDTO = {
      amount: 500,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: createdUser.id as string
    }

    const createdStatement = await createStatementUseCase.execute(statement);

    expect(createdStatement).toHaveProperty("id")
  })

  it("should not be able to create a statement with non existing user", async () => {
    const statement: ICreateStatementDTO = {
      amount: 500,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: ""
    }

    const createdStatement = createStatementUseCase.execute(statement);

    expect(createdStatement).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should not be able to create a withdraw statement with insufficient funds", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    const createdUser = await createUserUseCase.execute(user);

    const statement: ICreateStatementDTO = {
      amount: 100,
      description: "test",
      type: OperationType.WITHDRAW,
      user_id: createdUser.id as string
    }

    const createdStatement = createStatementUseCase.execute(statement);

    expect(createdStatement).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
