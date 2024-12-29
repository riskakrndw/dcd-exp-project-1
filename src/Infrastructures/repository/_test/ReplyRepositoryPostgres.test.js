const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const AddReply = require("../../../Domains/replies/entities/AddReply");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ReplyRepositoryPostgres", () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding",
    });

    await UsersTableTestHelper.addUser({
      id: "user-456",
      username: "dew",
      password: "123",
      fullname: "dew",
    });

    await ThreadsTableTestHelper.addThread({
      id: "thread-123",
      user_id: "user-123",
      title: "New Thread 123",
      body: "New thread body 123.",
      date: "2024-06-10T17:14:31.573Z",
    });

    // user-456 add comment comment-456
    await CommentsTableTestHelper.addComment({
      id: "comment-456",
      thread_id: "thread-123",
      user_id: "user-456",
      content: "New Comment from user-456",
      date: "2024-05-10T17:15:31.573Z",
    });

    await RepliesTableTestHelper.addReply({
      id: "comment-789",
      user_id: "user-123",
      thread_id: "thread-123",
      parent_id: "comment-456",
      content: "New Reply",
      date: "2024-05-10T17:15:31.573Z",
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("getReplies function", () => {
    it("should return reply result rows correctly", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action
      const replies = await replyRepositoryPostgres.getReplies("comment-456");
      const user = await UsersTableTestHelper.findUsersById("user-123");

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBe("comment-789");
      expect(replies[0].content).toBe("New Reply");
      expect(replies[0].user_id).toBe("user-123");
      expect(replies[0].is_deleted).toBe(false);
      expect(replies[0].username).toBe(user[0].username);
      expect(replies[0].date).toBeDefined();
    });
  });

  describe("addReply function", () => {
    it("should persist add reply", async () => {
      // Arrange
      const addReply = new AddReply({ content: "New Reply" });
      const fakeIdGenerator = () => "456";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const createdReply = await replyRepositoryPostgres.addReply(
        addReply,
        "thread-123",
        "comment-456",
        "user-123"
      );

      const reply = await RepliesTableTestHelper.findReplyById("comment-789");

      // Assert

      expect(createdReply.id).toBe("comment-456");
      expect(createdReply.user_id).toBe("user-123");
      expect(createdReply.thread_id).toBe("thread-123");
      expect(createdReply.parent_id).toBe("comment-456");
      expect(createdReply.content).toBe("New Reply");
      expect(createdReply.date).toBeDefined();

      expect(reply).toHaveLength(1);
      expect(reply[0].id).toBe("comment-789");
      expect(reply[0].user_id).toBe("user-123");
      expect(reply[0].thread_id).toBe("thread-123");
      expect(reply[0].parent_id).toBe("comment-456");
      expect(reply[0].content).toBe("New Reply");
      expect(reply[0].date).toBeDefined();
      expect(reply[0].is_deleted).toBe(false);
    });
  });

  describe("isReplyExist function", () => {
    it("should throw error when reply not found", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      reply = await RepliesTableTestHelper.addReply({
        id: "reply-008",
        user_id: "user-123",
        thread_id: "thread-123",
        parent_id: "comment-456",
        content: "New Reply",
        date: "2024-05-10T17:15:31.573Z",
      });

      // Action
      await expect(
        replyRepositoryPostgres.isReplyExist("reply-007")
      ).rejects.toThrowError(new NotFoundError("reply not found"));
    });

    it("should not throw error when reply found", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await RepliesTableTestHelper.addReply({
        id: "reply-008",
        user_id: "user-123",
        thread_id: "thread-123",
        parent_id: "comment-456",
        content: "New Reply",
        date: "2024-05-10T17:15:31.573Z",
      });

      // Action
      const result = await replyRepositoryPostgres.isReplyExist("reply-008");

      // Assert
      expect(result.id).toBe("reply-008");
      expect(result.content).toBe("New Reply");
      expect(result.user_id).toBe("user-123");
      expect(result.thread_id).toBe("thread-123");
      expect(result.parent_id).toBe("comment-456");
      expect(result.date).toBeDefined();
    });
  });

  describe("isOwnerReplied function", () => {
    it("should throw error when user have no rights", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await RepliesTableTestHelper.addReply({
        id: "reply-008",
        user_id: "user-123",
        thread_id: "thread-123",
        parent_id: "comment-456",
        content: "New Reply",
        date: "2024-05-10T17:15:31.573Z",
      });

      // Action
      await expect(
        replyRepositoryPostgres.isOwnerReplied("user-456", "reply-008")
      ).rejects.toThrowError(new AuthorizationError("cant delete reply"));
    });

    it("should not throw error when user have rights", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await RepliesTableTestHelper.addReply({
        id: "reply-008",
        user_id: "user-123",
        thread_id: "thread-123",
        parent_id: "comment-456",
        content: "New Reply",
        date: "2024-05-10T17:15:31.573Z",
      });

      // Action
      const result = await replyRepositoryPostgres.isOwnerReplied(
        "user-123",
        "reply-008"
      );

      // Assert
      expect(result.id).toBe("reply-008");
      expect(result.content).toBe("New Reply");
      expect(result.user_id).toBe("user-123");
      expect(result.thread_id).toBe("thread-123");
      expect(result.parent_id).toBe("comment-456");
      expect(result.date).toBeDefined();
    });
  });

  describe("deleteReply function", () => {
    it("should return 0 rowCount when reply not found", async () => {
      // Arrange
      const addReply = new AddReply({ content: "New Reply" });
      const fakeIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const createdReply = await replyRepositoryPostgres.addReply(
        addReply,
        "thread-123",
        "comment-456",
        "user-456"
      );

      // Action & Assert
      expect(createdReply.id).toBe("comment-123");
      expect(createdReply.user_id).toBe("user-456");
      expect(createdReply.thread_id).toBe("thread-123");
      expect(createdReply.parent_id).toBe("comment-456");
      expect(createdReply.content).toBe("New Reply");
      expect(createdReply.date).toBeDefined();

      await expect(
        replyRepositoryPostgres.deleteReply("comment-xxxx")
      ).rejects.toThrowError(
        new Error("Failed to delete reply. Reply not found.")
      );
    });

    it("should persist delete reply", async () => {
      // Arrange
      const addReply = new AddReply({ content: "New Reply" });
      const fakeIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const createdReply = await replyRepositoryPostgres.addReply(
        addReply,
        "thread-123",
        "comment-456",
        "user-123"
      );

      // Action
      const result = await replyRepositoryPostgres.deleteReply("comment-123");

      // Assert
      expect(createdReply.id).toBe("comment-123");
      expect(createdReply.user_id).toBe("user-123");
      expect(createdReply.thread_id).toBe("thread-123");
      expect(createdReply.parent_id).toBe("comment-456");
      expect(createdReply.content).toBe("New Reply");
      expect(createdReply.date).toBeDefined();

      expect(result.id).toBe("comment-123");
      expect(result.user_id).toBe("user-123");
      expect(result.thread_id).toBe("thread-123");
      expect(result.parent_id).toBe("comment-456");
      expect(result.content).toBe("New Reply");
      expect(result.date).toBeDefined();
    });
  });
});
