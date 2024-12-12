const AddedComment = require("../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../Domains/comments/CommentRepository");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment, thread_id, user_id) {
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO comments (id, thread_id, parent_id, content, date, is_deleted) VALUES($1, $2, NULL, $3, $4, $5) RETURNING id, thread_id,  content, date, is_deleted",
      values: [id, thread_id, addComment.content, date, false],
    };

    const { rows } = await this._pool.query(query);
    return rows[0];
  }

  async getComment(commentId) {
    const query = {
      text: `SELECT *
            FROM comments as c
            WHERE c.id = $1`,
      values: [commentId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = CommentRepositoryPostgres;
