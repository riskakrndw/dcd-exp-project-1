const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async getReplies(comment_id) {
    const query = {
      text: `
        SELECT 
          c.id, 
          c.content,
          c.user_id, 
          c.is_deleted, 
          u.username, 
          c.date
        FROM comments as c
        INNER JOIN users as u ON c.user_id = u.id
        WHERE 
          parent_id = $1
        ORDER BY c.date ASC
      `,
      values: [comment_id],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async addReply(addReply, thread_id, comment_id, user_id) {
    const id = `comment-${this._idGenerator()}`;
    const { content } = addReply;
    const date = new Date().toISOString();

    const query = {
      text: `INSERT INTO comments(id, user_id, thread_id, parent_id, content, date) 
            VALUES($1, $2, $3, $4, $5, $6) RETURNING id, user_id, thread_id, parent_id, content, date`,
      values: [id, user_id, thread_id, comment_id, content, date],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async isReplyExist(reply_id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [reply_id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError("reply not found");
    }

    return result.rows[0];
  }

  async isOwnerReplied(user_id, reply_id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1 AND user_id = $2",
      values: [reply_id, user_id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError("cant delete reply");
    }

    return result.rows[0];
  }

  async deleteReply(reply_id) {
    const query = {
      text: "UPDATE comments SET is_deleted = TRUE WHERE id = $1 RETURNING id, user_id, thread_id, parent_id, content, date",
      values: [reply_id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error("Failed to delete reply. Reply not found.");
    }

    return result.rows[0];
  }
}

module.exports = ReplyRepositoryPostgres;
