import * as dotenv from "dotenv";
import { Address, Hash } from "@/models/Bytes";
dotenv.config();

class DB {
  constructor(readonly url: URL) {}
}

class Server {
  constructor(readonly host: string, readonly port: number) {}
}

class Eth {
  constructor(
    readonly rpcUrl: string,
    readonly jobContractAddress: Address,
    readonly jobContractTx: Hash
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

const config = new Config(
  new DB(new URL(requireEnv("DATABASE_URL"))),
  new Server(requireEnv("SERVER_HOST"), parseInt(requireEnv("SERVER_PORT"))),
  requireEnv("JWT_SECRET"),
  requireEnv("WEB3_STORAGE_TOKEN"),
  new Eth(
    requireEnv("ETH_RPC_URL"),
    new Address(requireEnv("ETH_JOB_CONTRACT_ADDRESS")),
    new Hash(requireEnv("ETH_JOB_CONTRACT_TX"))
  )
);

export default config;
