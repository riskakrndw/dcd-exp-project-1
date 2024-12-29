const CommentedThread = require("../../Domains/threads/entities/CommentedThread");

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const getThread = await this._threadRepository.getThread(threadId);

    const getComments = await this._commentRepository.getComments(threadId);

    const getReplies = async (commentId) => {
      const replies = await this._replyRepository.getReplies(commentId);

      return replies.length > 0
        ? replies.map((reply) => ({
            id: reply.id,
            content: reply.is_deleted
              ? "**balasan telah dihapus**"
              : reply.content,
            date: reply.date ? new Date(reply.date).toISOString() : null,
            username: reply.username,
          }))
        : [];
    };

    try {
      const comments = await Promise.all(
        getComments.map(async (comment) => ({
          id: comment.id,
          username: comment.username,
          date: new Date(comment.date).toISOString(),
          content: comment.is_deleted
            ? "**komentar telah dihapus**"
            : comment.content,
          replies: await getReplies(comment.id),
        }))
      );

      return new CommentedThread({
        id: getThread[0].id,
        title: getThread[0].title,
        body: getThread[0].body,
        date: getThread[0].date.toISOString(),
        username: getThread[0].username,
        comments,
      });
    } catch (error) {
      throw new Error("Gagal memproses thread");
    }
  }
}

module.exports = GetThreadUseCase;
