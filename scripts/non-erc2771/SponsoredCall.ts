import {
  SponsoredCallRequest,
  GelatoRelay,
} from "@gelatonetwork/relay-sdk-viem";
import { createPublicClient, http, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, polygonAmoy, sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { counterAbi } from "../utils/counterAbi";
import config from "../config/networks/sepolia.json";
const privateKey = process.env.PRIVATE_KEY;

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});
const relay = new GelatoRelay();
const account = privateKeyToAccount(privateKey as `0x{string}`);
console.log(account.address);

const testSponsoredCall = async () => {
  const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY as string;
  const counterAddress = config.addresses.simpleCounter;

  const user = account.address;
  console.log(user);

  //encode function data
  const data = encodeFunctionData({
    abi: counterAbi,
    functionName: "increment",
  });

  const relayRequest = {
    chainId: (await client.getChainId()) as unknown,
    target: counterAddress,
    data,
  } as SponsoredCallRequest;

  const response = await relay.sponsoredCall(
    relayRequest,
    GELATO_RELAY_API_KEY
  );
  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
};

testSponsoredCall();
