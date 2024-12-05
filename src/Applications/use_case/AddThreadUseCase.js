const AddThread = require("../../Domains/threads/entities/AddThread");
const AddedThread = require("../../Domains/threads/entities/AddedThread");

class AddThreadUseCase {
  constructor({ threadRepository }) {
    console.log("thread uc 1");
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, user_id) {
    console.log("thread uc 2");
    const addThread = new AddThread(useCasePayload);
    console.log("thread uc 3");
    const addedThread = await this._threadRepository.addThread(
      addThread,
      user_id
    );
    console.log("thread uc 4");

    return new AddedThread({ ...addedThread });
  }
}

module.exports = AddThreadUseCase;
