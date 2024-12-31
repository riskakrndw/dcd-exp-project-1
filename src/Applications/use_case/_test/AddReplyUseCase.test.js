const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const AddReply = require("../../../Domains/replies/entities/AddReply");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const AddReplyUseCase = require("../AddReplyUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("AddReplyUseCase", () => {
  it("should throw error when thread not available", async () => {
    // Arrange
    const useCasePayload = {
      content: "New reply",
    };

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.isThreadExist = jest
      .fn()
      .mockRejectedValue(new NotFoundError("thread tidak ditemukan"));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute(
        useCasePayload,
        "thread-123",
        "comment-123",
        "user-123"
      )
    ).rejects.toThrowError("thread tidak ditemukan");

    // Verifikasi fungsi mock
    expect(mockThreadRepository.isThreadExist).toBeCalledTimes(1);
    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
  });

  it("should throw error when comment not available", async () => {
    // Arrange
    const useCasePayload = {
      content: "New reply",
    };

    const mockThread = {
      id: "thread-123",
      user_id: "user-456",
      title: "New Thread 123",
      body: "New thread body 123",
      date: new Date(),
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.isThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.isCommentExist = jest
      .fn()
      .mockRejectedValue(new NotFoundError("komentar tidak ditemukan"));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute(
        useCasePayload,
        "thread-123",
        "comment-123",
        "user-123"
      )
    ).rejects.toThrowError("komentar tidak ditemukan");

    // Verifikasi fungsi mock
    expect(mockThreadRepository.isThreadExist).toBeCalledTimes(1);
    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.isCommentExist).toBeCalledTimes(1);
    expect(mockCommentRepository.isCommentExist).toHaveBeenCalledWith(
      "comment-123"
    );
  });

  it("should orchestrating the add reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "New reply",
    };
    const threadId = "thread-123";
    const commentId = "comment-123";
    const ownerId = "user-123";

    const mockAddedReply = new AddedReply({
      id: "reply-123",
      user_id: "user-123",
      thread_id: "thread-123",
      parent_id: "comment-123",
      content: useCasePayload.content,
      date: new Date("2024-05-10T17:15:31.573Z"),
      owner: "testuser",
    });
    const mockUser = {
      id: "user-123",
      username: "testuser",
      password: "secret",
      fullname: "testuser",
    };
    const mockThread = {
      id: "thread-123",
      user_id: "user-456",
      title: "New Thread 123",
      body: "New thread body 123",
      date: new Date(),
    };

    const mockComment = {
      id: "comment-123",
      user_id: "user-123",
      thread_id: "thread-123",
      parent_id: null,
      content: "New Comment from user-456",
      date: new Date("2024-05-10T17:15:31.573Z"),
      is_deleted: false,
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockUserRepository = new UserRepository();

    mockThreadRepository.isThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.isCommentExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));
    mockUserRepository.getUser = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockUser));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      threadId,
      commentId,
      ownerId
    );

    // Assert hasil
    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: "reply-123",
        content: useCasePayload.content,
        owner: "testuser",
      })
    );

    // Verifikasi fungsi mock
    expect(mockThreadRepository.isThreadExist).toBeCalledTimes(1);
    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.isCommentExist).toBeCalledTimes(1);
    expect(mockCommentRepository.isCommentExist).toHaveBeenCalledWith(
      commentId
    );
    expect(mockReplyRepository.addReply).toBeCalledTimes(1);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      new AddReply({ content: useCasePayload.content }),
      threadId,
      commentId,
      ownerId
    );
    expect(mockUserRepository.getUser).toBeCalledTimes(1);
    expect(mockUserRepository.getUser).toHaveBeenCalledWith(ownerId);
  });
});
