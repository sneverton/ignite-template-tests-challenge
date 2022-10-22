import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("Authenticate User", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    })

    expect(result).toHaveProperty("token");
  })

  it("should not be able to authenticate an non existent user", async () => {
    const result = authenticateUserUseCase.execute({
      email: 'test@test.test',
      password: 'test'
    })

    expect(result).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it("should not be able to authenticate with incorrect password", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    await createUserUseCase.execute(user);

    const result = authenticateUserUseCase.execute({
      email: user.email,
      password: ''
    })

    expect(result).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })
})
