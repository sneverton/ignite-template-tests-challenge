import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


describe("Show User Profile", () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let showUserProfileUseCase: ShowUserProfileUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })


  it("should be able to show a user profile", async () => {
    const user: ICreateUserDTO = {
      name: 'Test',
      email: 'test@test.test',
      password: 'test'
    }

    const createdUser = await createUserUseCase.execute(user);

    const showedUser = await showUserProfileUseCase.execute(createdUser.id as string)

    expect(showedUser.email).toBe(user.email)
  })

  it("should not be able to show a non existing user profile", async () => {
    const showedUser = showUserProfileUseCase.execute("test")

    expect(showedUser).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
