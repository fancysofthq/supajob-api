import server from "./server/index.js";
import { syncEvents } from "./logic/eth.js";
import config from "./config.js";

let cancel = false;

syncEvents(() => cancel);

console.log(`Listening at http://${config.server.host}:${config.server.port}`);
server.listen(config.server.port, config.server.host);
