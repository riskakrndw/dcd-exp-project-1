class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(ownerId, threadId, commentId, replyId) {
    await this._threadRepository.isThreadExist(threadId);

    await this._commentRepository.isCommentExist(commentId);

    await this._replyRepository.isReplyExist(replyId);

    await this._replyRepository.isOwnerReplied(ownerId, replyId);

    this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
