const AddThread = require("../../../Domains/threads/entities/AddThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const AddThreadUseCase = require("../AddThreadUseCase");

describe("AddThreadUseCase", () => {
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "New Thread",
      body: "New Thread body",
    };
    const mockAddedThread = {
      id: "thread-123",
      title: useCasePayload.title,
      user_id: "user-123",
    };
    const mockUser = {
      id: "user-123",
      username: "testuser",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));
    mockUserRepository.getUser = jest.fn().mockResolvedValue(mockUser);

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedThread = await getThreadUseCase.execute(
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
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
      "user-123"
    );
    expect(mockUserRepository.getUser).toBeCalledWith("user-123");
  });
});
