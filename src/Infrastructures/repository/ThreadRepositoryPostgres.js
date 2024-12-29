const AddedThread = require("../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread, user_id) {
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO threads VALUES($1, $2, $3, $4,  CURRENT_TIMESTAMP) RETURNING id, user_id, title, body, date",
      values: [id, user_id, addThread.title, addThread.body],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async getThread(threadId) {
    const query = {
      text: `SELECT t.id, t.title, t.body, u.username, t.date
            FROM threads as t
            INNER JOIN users AS u ON t."user_id" = u.id
            WHERE t.id = $1`,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async isThreadExist(threadId) {
    const query = {
      text: "SELECT * FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError("thread not found");
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
