import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"
import { ICreateUserDTO } from "./ICreateUserDTO";


describe("Create User", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })


  it("should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    await createUserUseCase.execute(user);

    const createdUser = await inMemoryUsersRepository.findByEmail(user.email)

    expect(createdUser).toHaveProperty("id")
  })

  it("should not be able to create a new user with existing email", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    await createUserUseCase.execute(user);

    const createdUser = createUserUseCase.execute(user);

    expect(createdUser).rejects.toBeInstanceOf(CreateUserError)
  })
})
