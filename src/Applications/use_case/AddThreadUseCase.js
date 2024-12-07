const AddThread = require("../../Domains/threads/entities/AddThread");
const AddedThread = require("../../Domains/threads/entities/AddedThread");

class AddThreadUseCase {
  constructor({ threadRepository, userRepository, user_id }) {
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
    this.user_id = user_id;
  }

  async execute(useCasePayload, user_id) {
    const addThread = new AddThread(useCasePayload);
    const addedThread = await this._threadRepository.addThread(
      addThread,
      user_id
    );

    const user = await this._userRepository.getUser(user_id);

    return new AddedThread({ ...addedThread, owner: user.username });
  }
}

module.exports = AddThreadUseCase;
