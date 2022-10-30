import 'reflect-metadata';

import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { GetBalanceError } from './GetBalanceError';


describe("Get Balance", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let getBalanceUseCase: GetBalanceUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  })

  it("should be able to show a user balance", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    const createdUser = await createUserUseCase.execute(user);

    const response = await getBalanceUseCase.execute({user_id: createdUser.id as string})

    expect(response).toHaveProperty('balance')
  })

  it("should not be able to show a balance of non existing user", async () => {
    const response = getBalanceUseCase.execute({user_id: 'test'})

    expect(response).rejects.toBeInstanceOf(GetBalanceError)
  })
})
