import config from "../config.js";
import { ethers } from "ethers";
import { timeout } from "@/utils.js";
import pRetry from "p-retry";

console.log("Connecting to JSON-RPC provider at", config.eth.rpcUrl);
let provider = new ethers.providers.JsonRpcProvider(config.eth.rpcUrl);

export async function getProvider(): Promise<ethers.providers.JsonRpcProvider> {
  await pRetry(() => timeout(5000, provider.ready), {
    onFailedAttempt: (err) => {
      console.warn(err);
      console.log("Connecting to JSON-RPC provider at", config.eth.rpcUrl);
      provider = new ethers.providers.JsonRpcProvider(config.eth.rpcUrl);
    },
  });

  return provider;
}
