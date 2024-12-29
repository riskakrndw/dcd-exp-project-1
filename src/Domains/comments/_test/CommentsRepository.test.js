const CommentRepository = require("../CommentRepository");

describe("CommentRepository interface", () => {
  it("should throw error invoke abstract behaviour", async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action and Assert
    await expect(commentRepository.addComment({})).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentRepository.deleteComment({})).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentRepository.isCommentExist({})).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentRepository.isCommentByOwner({})).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(commentRepository.getComments({})).rejects.toThrowError(
      "COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
