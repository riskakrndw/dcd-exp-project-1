const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);

    const addedThread = await addThreadUseCase.execute(
      request.payload,
      request.auth.credentials.id
    );

    return h
      .response({
        status: "success",
        data: {
          addedThread,
        },
      })
      .code(201);
  }
}

module.exports = ThreadsHandler;
