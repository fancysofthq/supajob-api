import config from "../config.js";
import { ethers } from "ethers";
import { timeout } from "@/utils.js";

console.log("Connecting to JSON-RPC provider at", config.eth.rpcUrl);
export const provider = new ethers.providers.JsonRpcProvider(config.eth.rpcUrl);
await timeout(5000, provider.ready, "JSON-RPC provider not ready");
