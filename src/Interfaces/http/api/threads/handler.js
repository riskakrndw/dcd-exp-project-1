const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");

class ThreadsHandler {
  constructor(container) {
    console.log("ThreadsHandler 1");
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    console.log("ThreadsHandler 2");
    const { id: ownerId } = request.auth.credentials;
    console.log("ThreadsHandler 3");
    console.log("Auth credentials:", request.auth.credentials);
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    console.log("ThreadsHandler 4");
    const addedThread = await addThreadUseCase.execute(
      request.payload,
      ownerId
    );
    console.log("ThreadsHandler 5");

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
