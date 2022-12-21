import server from "./server";
import config from "./config";
import { runSyncJobs } from "./logic/sync";

runSyncJobs(() => false);

server.listen(config.server.port, config.server.host, () => {
  console.log(
    `Listening at http://${config.server.host}:${config.server.port}`
  );
});
