const AddThread = require("../../../Domains/threads/entities/AddThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const AddThreadUseCase = require("../AddThreadUseCase");
const { password } = require("pg/lib/defaults");

describe("AddThreadUseCase", () => {
  it("should orchestrate the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "New Thread",
      body: "New Thread body",
    };

    const mockAddedThread = {
      id: "thread-123",
      user_id: "user-123",
      title: useCasePayload.title,
      body: useCasePayload.body,
      date: new Date("2021-08-08T07:19:09.775Z"),
    };

    const mockUser = {
      id: "user-123",
      username: "testuser",
      password: "secret",
      fullname: "testuser",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));
    mockUserRepository.getUser = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockUser));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(
      useCasePayload,
      "user-123"
    );

    // Assert
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: "thread-123",
        title: useCasePayload.title,
        user_id: "user-123",
        owner: "testuser",
      })
    );

    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
      "user-123"
    );

    expect(mockUserRepository.getUser).toHaveBeenCalledWith("user-123");
  });
});
