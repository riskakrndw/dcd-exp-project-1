const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
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
    console.log("deleteReplyHandler 111");
    const { id: ownerId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    console.log("deleteReplyHandler 111 222");
    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name
    );

    console.log("deleteReplyHandler 222");
    await deleteReplyUseCase.execute(ownerId, threadId, commentId, replyId);

    console.log("deleteReplyHandler 333");

    return {
      status: "success",
    };
  }
}

module.exports = RepliesHandler;
