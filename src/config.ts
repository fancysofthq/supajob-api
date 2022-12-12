import * as dotenv from "dotenv";
import Address from "@/models/address.js";
dotenv.config();

class DB {
  constructor(readonly url: URL) {}
}

class ServerCredentials {
  constructor(readonly crtPath: string, readonly keyPath: string) {}
}

class Server {
  constructor(
    readonly credentials: ServerCredentials | undefined,
    readonly host: string,
    readonly port: number
  ) {}
}

class Eth {
  constructor(
    readonly rpcUrl: string,
    readonly jobBoardAddress: Address,
    readonly jobBoardTx: string
  ) {}
}

class Config {
  constructor(
    readonly db: DB,
    readonly server: Server,
    readonly jwtSecret: string,
    readonly web3StorageToken: string,
    readonly eth: Eth
  ) {}
}

function requireEnv(id: string): string {
  if (process.env[id]) return process.env[id]!;
  else throw `Missing env var ${id}`;
}

let credentials: ServerCredentials | undefined = undefined;

if (process.env.SERVER_CRT && process.env.SERVER_KEY) {
  credentials = new ServerCredentials(
    process.env.SERVER_CRT,
    process.env.SERVER_KEY
  );
} else {
  console.warn("Server credentials not configured, running in insecure mode");
}

const config = new Config(
  new DB(new URL(requireEnv("DATABASE_URL"))),
  new Server(
    credentials,
    requireEnv("SERVER_HOST"),
    parseInt(requireEnv("SERVER_PORT"))
  ),
  requireEnv("JWT_SECRET"),
  requireEnv("WEB3_STORAGE_TOKEN"),
  new Eth(
    requireEnv("ETH_RPC_URL"),
    new Address(requireEnv("ETH_JOB_BOARD_ADDRESS")),
    requireEnv("ETH_JOB_BOARD_TX")
  )
);

export default config;
