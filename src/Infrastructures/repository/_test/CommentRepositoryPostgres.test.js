const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const pool = require("../../database/postgres/pool");
const AddComment = require("../../../Domains/comments/entities/AddComment");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    });

    await UsersTableTestHelper.addUser({
      id: "user-456",
      username: "dicoding2",
      password: "rahasia",
      fullname: "Dicoding Academy",
    });

    await ThreadsTableTestHelper.addThread({
      id: "thread-123",
      title: "New Thread 123",
      body: "New thread body 123.",
      user_id: "user-123",
      date: "2024-06-10T17:14:31.573Z",
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    // await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist add comment", async () => {
      // Arrange
      const addComment = new AddComment({ content: "New Comment" });
      const fakeIdGenerator = () => "456";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const createdComment = await commentRepositoryPostgres.addComment(
        addComment,
        "thread-123",
        "user-456"
      );

      // Assert
      expect(createdComment.id).toBe("comment-456");
      expect(createdComment.user_id).toBe("user-456");
      expect(createdComment.thread_id).toBe("thread-123");
      expect(createdComment.content).toBe("New Comment");
      expect(createdComment.date).toBeDefined();
      expect(createdComment.is_deleted).toBe(false);

      const comment = await CommentsTableTestHelper.findCommentById(
        "comment-456"
      );

      expect(comment).toHaveLength(1);
      expect(comment[0].id).toBe("comment-456");
      expect(comment[0].user_id).toBe("user-456");
      expect(comment[0].thread_id).toBe("thread-123");
      expect(comment[0].content).toBe("New Comment");
      expect(comment[0].date).toBeDefined();
      expect(comment[0].is_deleted).toBe(false);
    });
  });

  describe("deleteComment", () => {
    it("should throw error when comment not found", async () => {
      // Arrange
      const addComment = new AddComment({
        content: "New Comment will be deleted",
      });
      const fakeIdGenerator = () => "456";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const createdComment = await commentRepositoryPostgres.addComment(
        addComment,
        "thread-123",
        "user-456"
      );

      // Assert
      expect(createdComment.id).toBe("comment-456");
      expect(createdComment.user_id).toBe("user-456");
      expect(createdComment.thread_id).toBe("thread-123");
      expect(createdComment.content).toBe("New Comment will be deleted");
      expect(createdComment.date).toBeDefined();
      expect(createdComment.is_deleted).toBe(false);

      // Assert
      await expect(
        commentRepositoryPostgres.deleteComment("comment-123")
      ).rejects.toThrowError(
        new AuthorizationError("Failed to delete comment. Comment not found.")
      );
    });

    it("should persist delete comment", async () => {
      // Arrange
      const addComment = new AddComment({
        content: "New Comment will be deleted",
      });
      const fakeIdGenerator = () => "456";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const createdComment = await commentRepositoryPostgres.addComment(
        addComment,
        "thread-123",
        "user-456"
      );

      // Assert
      expect(createdComment.id).toBe("comment-456");
      expect(createdComment.user_id).toBe("user-456");
      expect(createdComment.thread_id).toBe("thread-123");
      expect(createdComment.content).toBe("New Comment will be deleted");
      expect(createdComment.date).toBeDefined();
      expect(createdComment.is_deleted).toBe(false);

      // Action
      const result = await commentRepositoryPostgres.deleteComment(
        "comment-456"
      );

      // Assert
      expect(result.id).toBe("comment-456");
      expect(result.user_id).toBe("user-456");
      expect(result.thread_id).toBe("thread-123");
      expect(result.content).toBe("New Comment will be deleted");
      expect(result.date).toBeDefined();
      expect(result.is_deleted).toBe(true);

      const commentDeleted = await CommentsTableTestHelper.findCommentById(
        "comment-456"
      );

      expect(commentDeleted[0].is_deleted).toEqual(true);
    });
  });

  describe("isCommentExist function", () => {
    it("should throw error when comment not found", async () => {
      // Arrange
      const addComment = new AddComment({ content: "New Comment" });
      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const createdComment = await commentRepositoryPostgres.addComment(
        addComment,
        "thread-123",
        "user-123"
      );

      // Assert
      expect(createdComment.id).toBe("comment-123");
      expect(createdComment.user_id).toBe("user-123");
      expect(createdComment.thread_id).toBe("thread-123");
      expect(createdComment.content).toBe("New Comment");
      expect(createdComment.date).toBeDefined();
      expect(createdComment.is_deleted).toBe(false);

      // Assert
      const isCommentExist = async () =>
        commentRepositoryPostgres.isCommentExist("comment-456");
      await expect(isCommentExist).rejects.toThrowError(
        new NotFoundError("komentar tidak ditemukan")
      );
    });

    it("should not throw error when comment found", async () => {
      // Arrange
      const addComment = new AddComment({ content: "New Comment" });
      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const createdComment = await commentRepositoryPostgres.addComment(
        addComment,
        "thread-123",
        "user-123"
      );

      // Assert
      expect(createdComment.id).toBe("comment-123");
      expect(createdComment.user_id).toBe("user-123");
      expect(createdComment.thread_id).toBe("thread-123");
      expect(createdComment.content).toBe("New Comment");
      expect(createdComment.date).toBeDefined();
      expect(createdComment.is_deleted).toBe(false);

      const result = await commentRepositoryPostgres.isCommentExist(
        "comment-123"
      );

      // Assert
      expect(result.id).toBe("comment-123");
      expect(result.user_id).toBe("user-123");
      expect(result.thread_id).toBe("thread-123");
      expect(result.content).toBe("New Comment");
      expect(result.date).toBeDefined();
      expect(result.is_deleted).toBe(false);
    });
  });

  describe("isCommentByOwner function", () => {
    it("should throw error AuthorizationError", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        thread_id: "thread-123",
        user_id: "user-123",
        content: "New Comment from user-456",
        is_deleted: false,
        date: "2024-05-10T17:15:31.573Z",
      });

      // Assert
      await expect(
        commentRepositoryPostgres.isCommentByOwner("user-001", "comment-123")
      ).rejects.toThrowError(
        new AuthorizationError("tidak berhak menghapus komentar")
      );
    });

    it("should not throw error AuthorizationError", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        thread_id: "thread-123",
        user_id: "user-123",
        content: "New Comment from user-456",
        date: "2024-05-10T17:15:31.573Z",
        is_deleted: false,
      });

      // Action
      const result = await commentRepositoryPostgres.isCommentByOwner(
        "user-123",
        "comment-123"
      );

      // Assert
      expect(result.id).toBe("comment-123");
      expect(result.user_id).toBe("user-123");
      expect(result.thread_id).toBe("thread-123");
      expect(result.content).toBe("New Comment from user-456");
      expect(result.date).toBeDefined();
      expect(result.is_deleted).toBe(false);
    });
  });

  describe("getComments function", () => {
    it("should return all comments of a thread", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({
        id: "comment-111",
        content: "Comment 1",
        thread_id: "thread-123",
        user_id: "user-123",
        is_deleted: false,
        date: "2024-05-10T17:15:31.573Z",
      });

      // Action
      const comments = await commentRepositoryPostgres.getComments(
        "thread-123"
      );

      // Assert
      expect(comments).toHaveLength(1);

      expect(comments[0].id).toBe("comment-111");
      expect(comments[0].user_id).toBe("user-123");
      expect(comments[0].content).toBe("Comment 1");
      expect(comments[0].is_deleted).toBe(false);
      expect(comments[0].username).toBe("dicoding");
      expect(comments[0].date).toBeDefined();
    });
  });
});
