const AddComment = require("../../../Domains/comments/entities/AddComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const AddCommentUseCase = require("../AddCommentUseCase");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
describe("AddCommentUseCase", () => {
  it("should orchestrating the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "New comment",
    };
    const threadId = "thread-123";
    const ownerId = "user-123";
    const mockAddedComment = {
      id: "comment-123",
      content: useCasePayload.content,
      owner: "user-123",
    };
    const mockUser = {
      id: "user-123",
      username: "testuser",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.isThreadExist = jest
      .fn()
      .mockImplementation(async () => Promise.resolve());
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    mockUserRepository.getUser = jest.fn().mockResolvedValue(mockUser);

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(
      useCasePayload,
      threadId,
      ownerId
    );

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: "comment-123",
        content: useCasePayload.content,
        owner: "testuser",
      })
    );
    expect(mockThreadRepository.isThreadExist).toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new AddComment({
        content: useCasePayload.content,
      }),
      threadId,
      ownerId
    );
  });

  it("should throw NotFoundError when threadId is not provided", async () => {
    // Arrange
    const useCasePayload = { content: "New comment" };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Act & Assert
    await expect(
      addCommentUseCase.execute(useCasePayload, null, "user-123")
    ).rejects.toThrowError(NotFoundError);
  });
});
