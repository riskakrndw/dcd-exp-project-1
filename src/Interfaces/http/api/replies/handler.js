const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { threadId } = request.params;
    const { commentId } = request.params;

    const addedReply = await addReplyUseCase.execute(
      request.payload,
      threadId,
      commentId,
      request.auth.credentials.id
    );

    return h
      .response({
        status: "success",
        data: {
          addedReply,
        },
      })
      .code(201);
  }

  async deleteReplyHandler(request) {
    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name
    );

    await deleteReplyUseCase.execute(ownerId, threadId, commentId, replyId);

    return {
      status: "success",
    };
  }
}

module.exports = RepliesHandler;
