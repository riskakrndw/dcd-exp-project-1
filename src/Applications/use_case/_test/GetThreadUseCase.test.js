const CommentedThread = require("../../../Domains/threads/entities/CommentedThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const GetThreadUseCase = require("../GetThreadUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("GetThreadUseCase", () => {
  it("should throw NotFoundError when thread is not found", async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThread = jest.fn().mockResolvedValue([]);
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act & Assert
    await expect(
      getThreadUseCase.execute("nonexistent-thread-id")
    ).rejects.toThrowError(NotFoundError);
    expect(mockThreadRepository.getThread).toBeCalledWith(
      "nonexistent-thread-id"
    );
  });

  it("should orchestrate the get thread action correctly", async () => {
    // Arrange
    const threadId = "thread-h_2FkLZhtgBKY2kh4CC02";
    const commentId = "comment-_pby2_tmXV6bcvcdev8xk";

    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: new Date("2021-08-08T07:19:09.775Z"),
      username: "dicoding",
    };

    const mockComments = [
      {
        id: commentId,
        username: "johndoe",
        date: new Date("2021-08-08T07:22:33.555Z"),
        content: "sebuah komentar",
        is_deleted: false,
      },
    ];

    const mockReplies = [
      {
        id: "reply-xNBtm9HPR-492AeiimpfN",
        content: "sebuah balasan",
        date: new Date("2021-08-08T08:07:01.522Z"),
        username: "dicoding",
        is_deleted: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThread = jest.fn().mockResolvedValue([mockThread]);
    mockCommentRepository.getComments = jest
      .fn()
      .mockResolvedValue(mockComments);
    mockReplyRepository.getReplies = jest.fn().mockResolvedValue(mockReplies);

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
                id: "reply-xNBtm9HPR-492AeiimpfN",
                content: "sebuah balasan",
                date: "2021-08-08T08:07:01.522Z",
                username: "dicoding",
              },
            ],
          },
        ],
      })
    );

    expect(mockThreadRepository.getThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getComments).toBeCalledWith(threadId);
    expect(mockReplyRepository.getReplies).toBeCalledWith(commentId);
  });

  it("should return thread with deleted comments and replies properly formatted", async () => {
    // Arrange
    const threadId = "thread-h_2FkLZhtgBKY2kh4CC02";
    const commentId = "comment-_pby2_tmXV6bcvcdev8xk";

    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: new Date("2021-08-08T07:19:09.775Z"),
      username: "dicoding",
    };

    const mockComments = [
      {
        id: commentId,
        username: "johndoe",
        date: new Date("2021-08-08T07:22:33.555Z"),
        content: "",
        is_deleted: true,
      },
    ];

    const mockReplies = [
      {
        id: "reply-xNBtm9HPR-492AeiimpfN",
        content: "",
        date: new Date("2021-08-08T08:07:01.522Z"),
        username: "dicoding",
        is_deleted: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThread = jest.fn().mockResolvedValue([mockThread]);
    mockCommentRepository.getComments = jest
      .fn()
      .mockResolvedValue(mockComments);
    mockReplyRepository.getReplies = jest.fn().mockResolvedValue(mockReplies);

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
                id: "reply-xNBtm9HPR-492AeiimpfN",
                content: "**balasan telah dihapus**",
                date: "2021-08-08T08:07:01.522Z",
                username: "dicoding",
              },
            ],
          },
        ],
      })
    );

    expect(mockThreadRepository.getThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getComments).toBeCalledWith(threadId);
    expect(mockReplyRepository.getReplies).toBeCalledWith(commentId);
  });
});
