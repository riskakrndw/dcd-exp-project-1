const ThreadsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "threads",
  register: async (server, { container }) => {
    console.log("Threads plugin registered");
    const threadsHandler = new ThreadsHandler(container);
    server.route(routes(threadsHandler));
  },
};
