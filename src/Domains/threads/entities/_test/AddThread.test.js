const AddThread = require("../AddThread");

describe("a AddThread entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    const payload = {
      title: "title thread",
    };

    expect(() => new AddThread(payload)).toThrowError(
      "ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      title: "title thread",
      body: 12314,
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError(
      "ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create AddThread object correctly", () => {
    // Arrange
    const payload = {
      title: "title thread",
      body: "asdfghjkl",
    };

    // Action
    const { title, body } = new AddThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
