const CommentRepository = require("../../Domains/comments/CommentRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment, thread_id, user_id) {
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO comments (id, user_id, thread_id, parent_id, content, date, is_deleted) VALUES($1, $2, $3, NULL, $4, $5, $6) RETURNING id, user_id, thread_id,  content, date, is_deleted",
      values: [id, user_id, thread_id, addComment.content, date, false],
    };

    const { rows } = await this._pool.query(query);
    return rows[0];
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_deleted = TRUE WHERE id = $1",
      values: [commentId],
    };
    return this._pool.query(query);
  }

  async isCommentExist(commentId) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }
  }

  async isCommentByOwner(ownerId, commentId) {
    const query = {
      text: "SELECT 1 FROM comments WHERE id = $1 AND user_id = $2",
      values: [commentId, ownerId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError("tidak berhak menghapus komentar");
    }
  }

  async getComments(threadId) {
    const query = {
      text: `
        SELECT 
          c.id, 
          c.user_id, 
          c.content,
          c.is_deleted, 
          u.username, 
          c.date
        FROM comments as c
        INNER JOIN users as u ON c.user_id = u.id
        WHERE 
          c.thread_id = $1
          AND c.parent_id IS NULL  
      `,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = CommentRepositoryPostgres;
