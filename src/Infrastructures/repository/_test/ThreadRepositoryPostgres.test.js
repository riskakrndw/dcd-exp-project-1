const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const pool = require("../../database/postgres/pool");
const AddThread = require("../../../Domains/threads/entities/AddThread");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ThreadRepositoryPostgres", () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: "user-456",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    });

    // Debugging: Cek apakah user berhasil ditambahkan
    const user = await UsersTableTestHelper.findUsersById("user-456");
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist add thread", async () => {
      // Arrange
      const addThread = new AddThread({
        title: "New Thread",
        body: "New Thread body",
      });
      const fakeIdGenerator = () => "123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const usersBeforeThread = await UsersTableTestHelper.findUsersById(
        "user-456"
      );

      // Action
      const createdThread = await threadRepositoryPostgres.addThread(
        addThread,
        usersBeforeThread[0].id
      );

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById("thread-123");

      expect(createdThread.id).toBe("thread-123");
      expect(createdThread.user_id).toBe("user-456");
      expect(createdThread.title).toBe(addThread.title);
      expect(createdThread.body).toBe(addThread.body);
      expect(new Date(createdThread.date).toISOString()).toBeTruthy();

      expect(thread).toHaveLength(1);
      expect(thread[0].id).toBe("thread-123");
      expect(thread[0].user_id).toBe("user-456");
      expect(thread[0].title).toBe(addThread.title);
      expect(thread[0].body).toBe(addThread.body);
      expect(new Date(thread[0].date).toISOString()).toBe(
        new Date(thread[0].date).toISOString()
      );
    });
  });

  describe("getThread function", () => {
    it("should return detail from thread", async () => {
      const fakeIdGenerator = () => "123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      /** Add thread */
      const addThread = {
        id: "thread-123",
        title: "New Thread 123",
        body: "New thread body 123.",
        user_id: "user-456",
      };
      await ThreadsTableTestHelper.addThread(addThread);

      // Action
      const thread = await threadRepositoryPostgres.getThread(addThread.id);

      // Assert
      await expect(thread).toHaveLength(1);
      await expect(thread[0].id).toBe(addThread.id);
      await expect(thread[0].title).toBe(addThread.title);
      await expect(thread[0].body).toBe(addThread.body);
      await expect(thread[0].username).toBe("dicoding");
      await expect(thread[0].date).toBeDefined();
    });
  });

  describe("isThreadExist function", () => {
    it("should throw error when thread not found", async () => {
      // const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const isThreadExist = async () =>
        threadRepositoryPostgres.isThreadExist("thread-001");

      // Assert
      await expect(isThreadExist).rejects.toThrowError(
        new NotFoundError("thread not found")
      );
    });

    it("should not throw error", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      /** Add thread */
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "New Thread 123",
        body: "New thread body 123",
        user_id: "user-456",
      });

      // Action
      const result = await threadRepositoryPostgres.isThreadExist("thread-123");

      // Assert
      await expect(result.id).toBe("thread-123");
      await expect(result.user_id).toBe("user-456");
      await expect(result.title).toBe("New Thread 123");
      await expect(result.body).toBe("New thread body 123");
      await expect(result.date).toBeDefined();
    });
  });
});
