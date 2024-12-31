const AddComment = require("../../../Domains/comments/entities/AddComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const AddCommentUseCase = require("../AddCommentUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const { date } = require("joi");

describe("AddCommentUseCase", () => {
  it("should orchestrating the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "New comment",
    };
    const threadId = "thread-123";
    const ownerId = "user-123";
    const mockThread = {
      id: "thread-123",
      user_id: "user-456",
      title: "New Thread 123",
      body: "New thread body 123",
      date: new Date(),
    };
    const mockAddedComment = {
      id: "comment-123",
      user_id: "user-123",
      thread_id: "thread-123",
      parent_id: null,
      content: useCasePayload.content,
      date: new Date(),
      is_deleted: false,
    };
    const mockUser = {
      id: "user-123",
      username: "testuser",
      password: "secret",
      fullname: "testuser",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    mockThreadRepository.isThreadExist = jest
      .fn()
      .mockImplementation(async () => Promise.resolve(mockThread));
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    mockUserRepository.getUser = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockUser));

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
    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      new AddComment({
        content: useCasePayload.content,
      }),
      threadId,
      ownerId
    );
    expect(mockUserRepository.getUser).toHaveBeenCalledWith(ownerId);
  });
});
