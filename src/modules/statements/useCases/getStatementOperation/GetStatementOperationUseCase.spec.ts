import 'reflect-metadata';

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { OperationType } from '../../entities/Statement';
import { GetStatementOperationError } from './GetStatementOperationError';


describe("Get Statement Operation", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let createStatementUseCase: CreateStatementUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able to show a statement operation", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    const createdUser = await createUserUseCase.execute(user);
    const user_id = createdUser.id as string;

    const createStatement = await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: 'deposit'
    });

    const response = await getStatementOperationUseCase.execute({
      user_id,
      statement_id: createStatement.id as string
    })

    expect(response).toHaveProperty('id')
    expect(response).toHaveProperty('amount')
  })

  it("should not be able to show a statement operation of non existing user", async () => {
    const response = getStatementOperationUseCase.execute({
      user_id: 'test',
      statement_id: 'test'
    })

    expect(response).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to show a non existing statement operation", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    const createdUser = await createUserUseCase.execute(user);

    const response =  getStatementOperationUseCase.execute({
      user_id: createdUser.id as string,
      statement_id: 'test'
    })

    expect(response).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
