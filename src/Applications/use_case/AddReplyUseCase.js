const AddReply = require("../../Domains/replies/entities/AddReply");
const AddedReply = require("../../Domains/replies/entities/AddedReply");

class AddReplyUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    userRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload, thread_id, comment_id, user_id) {
    const addReply = new AddReply(useCasePayload);

    await this._threadRepository.isThreadExist(thread_id);
    await this._commentRepository.isCommentExist(comment_id);

    const addedReply = await this._replyRepository.addReply(
      addReply,
      thread_id,
      comment_id,
      user_id
    );

    const user = await this._userRepository.getUser(user_id);

    return new AddedReply({ ...addedReply, owner: user.username });
  }
}

module.exports = AddReplyUseCase;
