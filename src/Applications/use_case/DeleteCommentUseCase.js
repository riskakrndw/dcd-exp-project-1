class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(user_id, thread_id, comment_id) {
    await this._threadRepository.isThreadExist(thread_id);

    await this._commentRepository.isCommentExist(comment_id);

    await this._commentRepository.isCommentByOwner(user_id, comment_id);

    this._commentRepository.deleteComment(comment_id);
  }
}

module.exports = DeleteCommentUseCase;
