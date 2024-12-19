const AddComment = require("../../Domains/comments/entities/AddComment");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository, userRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload, threadId, user_id) {
    if (!threadId) {
      throw new NotFoundError("threadId not found.");
    }

    const addComment = new AddComment(useCasePayload);

    await this._threadRepository.isThreadExist(threadId);

    const addedComment = await this._commentRepository.addComment(
      addComment,
      threadId,
      user_id
    );

    const user = await this._userRepository.getUser(user_id);

    return new AddedComment({ ...addedComment, owner: user.username });
  }
}

module.exports = AddCommentUseCase;
