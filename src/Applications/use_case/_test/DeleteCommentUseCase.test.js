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

    /** mocking needed function */
    mockThreadRepository.isThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.isCommentExist = jest.fn().mockResolvedValue();
    mockCommentRepository.isCommentByOwner = jest.fn().mockResolvedValue();
    mockCommentRepository.deleteComment = jest.fn().mockResolvedValue();

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(ownerId, threadId, commentId);

    // Assert
    expect(mockThreadRepository.isThreadExist).toBeCalledWith(threadId);
    expect(mockCommentRepository.isCommentExist).toBeCalledWith(commentId);
    expect(mockCommentRepository.isCommentByOwner).toBeCalledWith(
      ownerId,
      commentId
    );
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
  });
});
