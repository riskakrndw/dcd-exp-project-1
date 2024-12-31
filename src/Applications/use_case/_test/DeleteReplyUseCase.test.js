const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const DeleteReplyUseCase = require("../DeleteReplyUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("DeleteReplyUseCase", () => {
  it("should throw error when thread not found", async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.isThreadExist = jest.fn().mockImplementation(() => {
      throw new NotFoundError("thread tidak ditemukan");
    });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        "user-123",
        "thread-123",
        "comment-123",
        "reply-123"
      )
    ).rejects.toThrowError("thread tidak ditemukan");

    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
  });

  it("should throw error when comment not found", async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    const mockThread = {
      id: "thread-123",
      user_id: "user-456",
      title: "New Thread 123",
      body: "New thread body 123",
      date: new Date(),
    };

    mockThreadRepository.isThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.isCommentExist = jest.fn().mockImplementation(() => {
      throw new NotFoundError("komentar tidak ditemukan");
    });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        "user-123",
        "thread-123",
        "comment-123",
        "reply-123"
      )
    ).rejects.toThrowError("komentar tidak ditemukan");

    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.isCommentExist).toHaveBeenCalledWith(
      "comment-123"
    );
  });

  it("should throw error when reply not found", async () => {
    // Arrange
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

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

    /** mocking needed function */
    mockThreadRepository.isThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.isCommentExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockReplyRepository.isReplyExist = jest.fn().mockImplementation(() => {
      throw new NotFoundError("balasan tidak ditemukan");
    });

    /** creating use case */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        "user-123",
        "thread-123",
        "comment-123",
        "reply-123"
      )
    ).rejects.toThrowError("balasan tidak ditemukan");

    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.isCommentExist).toHaveBeenCalledWith(
      "comment-123"
    );
    expect(mockReplyRepository.isReplyExist).toHaveBeenCalledWith("reply-123");
  });

  it("should throw error when user have no rights", async () => {
    // Arrange
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

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

    const mockReply = {
      id: "reply-123",
      user_id: "user-123",
      thread_id: "thread-123",
      parent_id: "comment-456",
      content: "New Reply",
      date: new Date("2024-05-10T17:15:31.573Z"),
      is_deleted: false,
    };

    /** mocking needed function */
    mockThreadRepository.isThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.isCommentExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockReplyRepository.isReplyExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReply));
    mockReplyRepository.isOwnerReplied = jest.fn().mockImplementation(() => {
      throw new AuthorizationError("tidak berhak menghapus balasan");
    });

    /** creating use case */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute(
        "user-123",
        "thread-123",
        "comment-123",
        "reply-123"
      )
    ).rejects.toThrowError("tidak berhak menghapus balasan");

    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.isCommentExist).toHaveBeenCalledWith(
      "comment-123"
    );
    expect(mockReplyRepository.isReplyExist).toHaveBeenCalledWith("reply-123");
    expect(mockReplyRepository.isOwnerReplied).toHaveBeenCalledWith(
      "user-123",
      "reply-123"
    );
  });

  it("should orchestrating the delete reply action correctly", async () => {
    // Arrange
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

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

    const mockReply = {
      id: "reply-123",
      user_id: "user-123",
      thread_id: "thread-123",
      parent_id: "comment-456",
      content: "New Reply",
      date: new Date("2024-05-10T17:15:31.573Z"),
    };

    /** mocking needed function */
    mockThreadRepository.isThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.isCommentExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockReplyRepository.isReplyExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReply));
    mockReplyRepository.isOwnerReplied = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReply));
    mockReplyRepository.deleteReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReply));

    /** creating use case */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteReplyUseCase.execute(
      "user-123",
      "thread-123",
      "comment-123",
      "reply-123"
    );

    // Assert
    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.isCommentExist).toHaveBeenCalledWith(
      "comment-123"
    );
    expect(mockReplyRepository.isOwnerReplied).toHaveBeenCalledWith(
      "user-123",
      "reply-123"
    );
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith("reply-123");
  });
});
