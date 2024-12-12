/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable("comments", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    thread_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    parent_id: {
      type: "VARCHAR(50)",
      notNull: false,
    },
    content: {
      type: "TEXT",
      notNull: true,
    },
    date: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    is_deleted: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
  });

  pgm.addConstraint("comments", "fk_thread.threads", {
    foreignKeys: {
      columns: "thread_id",
      references: "threads(id)",
      onDelete: "CASCADE",
    },
  });

  pgm.addConstraint("comments", "fk_comments.parent_id", {
    foreignKeys: {
      columns: "parent_id",
      references: "comments(id)",
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("comments");
};
