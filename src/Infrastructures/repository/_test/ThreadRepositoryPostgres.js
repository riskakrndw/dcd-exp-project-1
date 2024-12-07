const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const pool = require("../../database/postgres/pool");
const AddThread = require("../../../Domains/threads/entities/AddThread");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
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
    // await UsersTableTestHelper.cleanTable();
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
        user_id: "user-456",
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
      await threadRepositoryPostgres.addThread(addThread, usersBeforeThread.id);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(thread).toHaveLength(1);
      //   expect(thread[0].id).toBe("thread-123");
      //   expect(thread[0].title).toBe(addThread.title);
      //   expect(thread[0].body).toBe(addThread.body);
      //   expect(thread[0].user_id).toBe("user-456");
    });
  });

  //   describe("getThread function", () => {
  //     it("should persist get thread", async () => {
  //       const fakeIdGenerator = () => "123";
  //       const threadRepositoryPostgres = new ThreadRepositoryPostgres(
  //         pool,
  //         fakeIdGenerator
  //       );

  //       /** Add thread */
  //       const addThread = {
  //         id: "thread-123",
  //         title: "New Thread 123",
  //         body: "New thread body 123.",
  //         user_id: "user-456",
  //       };
  //       await ThreadsTableTestHelper.addThread(addThread);

  //       // Action
  //       const thread = await threadRepositoryPostgres.getThread(addThread.id);
  //       const user = await UsersTableTestHelper.findUsersById(addThread.user_id);

  //       // Assert
  //       await expect(thread).toHaveLength(1);
  //       await expect(thread[0].id).toBe(addThread.id);
  //       await expect(thread[0].title).toBe(addThread.title);
  //       await expect(thread[0].body).toBe(addThread.body);
  //       await expect(thread[0].username).toBe(user[0].username);
  //     });
  //   });

  //   describe("verifyThread function", () => {
  //     it("should throw error when thread not found", async () => {
  //       // const fakeIdGenerator = () => '123';
  //       const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

  //       // Action
  //       const verifyThread = async () =>
  //         threadRepositoryPostgres.verifyThread("thread-001");

  //       // Assert
  //       await expect(verifyThread).rejects.toThrowError(
  //         new NotFoundError("thread not found")
  //       );
  //     });

  //     it("should not throw error", async () => {
  //       const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

  //       /** Add thread */
  //       await ThreadsTableTestHelper.addThread({
  //         id: "thread-123",
  //         title: "New Thread 123",
  //         body: "New thread body 123.",
  //         user_id: "user-456",
  //       });

  //       // Action
  //       const verifyThread = async () =>
  //         threadRepositoryPostgres.verifyThread("thread-123");

  //       // Assert
  //       await expect(verifyThread).not.toThrowError(
  //         new NotFoundError("thread not found")
  //       );
  //     });
  //   });
});
