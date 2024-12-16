const AddReply = require("../AddReply");

describe("and AddReply entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    const payload = {};
    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError(
      "ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      content: 123,
    };
    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError(
      "ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create addReply object correctly", () => {
    // Arrange
    const payload = {
      content: "New Reply",
    };
    // Action
    const { content } = new AddReply(payload);
    // Assert
    expect(content).toEqual(payload.content);
  });
});
