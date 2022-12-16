import server from "./server/index.js";
import sync from "./logic/sync.js";
import config from "./config.js";

let cancel = false;

sync(() => cancel);

console.log(`Listening at http://${config.server.host}:${config.server.port}`);
server.listen(config.server.port, config.server.host);
