import config from "../config.js";
import { ethers } from "ethers";
import { timeout } from "@/utils.js";

let provider: ethers.providers.BaseProvider;

console.log("Connecting to JSON-RPC provider at", config.eth.rpcUrl);
if (config.eth.rpcUrl.startsWith("ws")) {
  provider = new ethers.providers.WebSocketProvider(config.eth.rpcUrl);
} else {
  provider = new ethers.providers.JsonRpcProvider(config.eth.rpcUrl);
}

await timeout(5000, provider.ready, "JSON-RPC provider not ready");

export { provider };
