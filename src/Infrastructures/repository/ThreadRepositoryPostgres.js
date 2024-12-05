const AddedThread = require("../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread, user_id) {
    const id = `thread-${this._idGenerator()}`;
    const { title, body } = addThread;

    console.log("Adding thread with user_id:", user_id); // Debug

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, body, "user_id"',
      values: [id, title, body, user_id],
    };

    const { rows } = await this._pool.query(query);
    console.log("afterrrr", rows[0]);
    return rows[0];
  }

  async getThread(threadId) {
    const query = {
      text: `SELECT t.id, t.title, t.body, u.username
            FROM threads as t
            INNER JOIN users AS u ON t."user_id" = u.id
            WHERE t.id = $1`,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async verifyThread(threadId) {
    const query = {
      text: "SELECT * FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError("thread not found");
    }
  }
}

module.exports = ThreadRepositoryPostgres;