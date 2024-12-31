const CommentRepository = require("../../../Domains/comments/CommentRepository");
const DeleteCommentUseCase = require("../DeleteCommentUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("DeleteCommentUseCase", () => {
  it("should orchestrate the delete comment action correctly", async () => {
    // Arrange
    const ownerId = "user-123";
    const threadId = "thread-123";
    const commentId = "comment-123";

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

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
    mockCommentRepository.isCommentByOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockResolvedValue(mockComment);

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(ownerId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.isThreadExist).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.isCommentExist).toHaveBeenCalledWith(
      commentId
    );
    expect(mockCommentRepository.isCommentByOwner).toHaveBeenCalledWith(
      ownerId,
      commentId
    );
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(commentId);
  });
});
