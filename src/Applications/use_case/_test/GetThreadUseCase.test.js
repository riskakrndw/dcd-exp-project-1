const CommentedThread = require("../../../Domains/threads/entities/CommentedThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const GetThreadUseCase = require("../GetThreadUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");

describe("GetThreadUseCase", () => {
  it("should orchestrate the get thread action correctly", async () => {
    // Arrange
    const threadId = "thread-h_2FkLZhtgBKY2kh4CC02";
    const commentId = "comment-_pby2_tmXV6bcvcdev8xk";

    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      username: "dicoding",
      date: new Date("2021-08-08T07:19:09.775Z"),
    };

    const mockComments = [
      {
        id: commentId,
        user_id: "user-123",
        content: "sebuah komentar",
        is_deleted: false,
        username: "johndoe",
        date: new Date("2021-08-08T07:22:33.555Z"),
      },
    ];

    const mockReplies = [
      {
        id: "reply-1",
        content: "sebuah balasan",
        user_id: "user-456",
        is_deleted: false,
        username: "dicoding",
        date: new Date("2021-08-08T08:07:01.522Z"),
      },
      {
        id: "reply-2",
        content: "sebuah balasan",
        user_id: "user-456",
        is_deleted: false,
        username: "dicoding",
        date: null,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve([mockThread]));
    mockCommentRepository.getComments = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getReplies = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const result = await getThreadUseCase.execute(threadId);

    // Assert
    expect(result).toStrictEqual(
      new CommentedThread({
        id: threadId,
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2021-08-08T07:19:09.775Z",
        username: "dicoding",
        comments: [
          {
            id: commentId,
            username: "johndoe",
            date: "2021-08-08T07:22:33.555Z",
            content: "sebuah komentar",
            replies: [
              {
                id: "reply-1",
                content: "sebuah balasan",
                date: "2021-08-08T08:07:01.522Z",
                username: "dicoding",
              },
              {
                id: "reply-2",
                content: "sebuah balasan",
                date: null,
                username: "dicoding",
              },
            ],
          },
        ],
      })
    );

    expect(mockThreadRepository.getThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getComments).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getReplies).toHaveBeenCalledWith(commentId);
  });

  it("should get thread despite no reply in comment", async () => {
    // Arrange
    const threadId = "thread-h_2FkLZhtgBKY2kh4CC02";
    const commentId = "comment-_pby2_tmXV6bcvcdev8xk";

    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      username: "dicoding",
      date: new Date("2021-08-08T07:19:09.775Z"),
    };

    const mockComments = [
      {
        id: commentId,
        user_id: "user-123",
        content: "sebuah komentar",
        is_deleted: false,
        username: "johndoe",
        date: new Date("2021-08-08T07:22:33.555Z"),
      },
    ];

    const mockReplies = [];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve([mockThread]));
    mockCommentRepository.getComments = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getReplies = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const result = await getThreadUseCase.execute(threadId);

    // Assert
    expect(result).toStrictEqual(
      new CommentedThread({
        id: threadId,
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2021-08-08T07:19:09.775Z",
        username: "dicoding",
        comments: [
          {
            id: commentId,
            username: "johndoe",
            date: "2021-08-08T07:22:33.555Z",
            content: "sebuah komentar",
            replies: [],
          },
        ],
      })
    );

    expect(mockThreadRepository.getThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getComments).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getReplies).toHaveBeenCalledWith(commentId);
  });

  it("should return thread with deleted comments and replies properly formatted", async () => {
    // Arrange
    const threadId = "thread-h_2FkLZhtgBKY2kh4CC02";
    const commentId = "comment-_pby2_tmXV6bcvcdev8xk";

    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      username: "dicoding",
      date: new Date("2021-08-08T07:19:09.775Z"),
    };

    const mockComments = [
      {
        id: commentId,
        user_id: "user-123",
        content: "",
        is_deleted: true,
        username: "johndoe",
        date: new Date("2021-08-08T07:22:33.555Z"),
      },
    ];

    const mockReplies = [
      {
        id: "reply-1",
        content: "",
        user_id: "user-456",
        is_deleted: true,
        username: "dicoding",
        date: new Date("2021-08-08T08:07:01.522Z"),
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve([mockThread]));
    mockCommentRepository.getComments = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getReplies = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const result = await getThreadUseCase.execute(threadId);

    // Assert
    expect(result).toStrictEqual(
      new CommentedThread({
        id: threadId,
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2021-08-08T07:19:09.775Z",
        username: "dicoding",
        comments: [
          {
            id: commentId,
            username: "johndoe",
            date: "2021-08-08T07:22:33.555Z",
            content: "**komentar telah dihapus**",
            replies: [
              {
                id: "reply-1",
                content: "**balasan telah dihapus**",
                date: "2021-08-08T08:07:01.522Z",
                username: "dicoding",
              },
            ],
          },
        ],
      })
    );

    expect(mockThreadRepository.getThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getComments).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getReplies).toHaveBeenCalledWith(commentId);
  });

  it("should throw an error when processing thread fails", async () => {
    // Arrange
    const threadId = "thread-123";
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mock dependencies
    mockThreadRepository.getThread = jest.fn().mockImplementation(() =>
      Promise.resolve([
        {
          id: threadId,
          title: "sebuah thread",
          body: "sebuah body thread",
          username: "dicoding",
          date: new Date("2021-08-08T07:19:09.775Z"),
        },
      ])
    );
    mockCommentRepository.getComments = jest.fn().mockImplementation(() =>
      Promise.resolve([
        {
          id: "comment-123",
          user_id: "user-123",
          content: "sebuah komentar",
          is_deleted: false,
          username: "johndoe",
          date: new Date("2021-08-08T07:22:33.555Z"),
        },
      ])
    );
    // Simulate failure in fetching replies
    mockReplyRepository.getReplies = jest
      .fn()
      .mockRejectedValue(new Error("Database connection failed"));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act & Assert
    await expect(getThreadUseCase.execute(threadId)).rejects.toThrowError(
      "Gagal memproses thread"
    );

    // Verify methods are called correctly
    expect(mockThreadRepository.getThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getComments).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getReplies).toHaveBeenCalledWith("comment-123");
  });
});
