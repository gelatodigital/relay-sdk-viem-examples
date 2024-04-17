import {
  CallWithSyncFeeRequest,
  GelatoRelay,
} from "@gelatonetwork/relay-sdk-viem";
import { createWalletClient, http, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { counterAbi } from "../utils/counterAbi";
import config from "../config/networks/sepolia.json";
const privateKey = process.env.PRIVATE_KEY;

const relay = new GelatoRelay();
const account = privateKeyToAccount(privateKey as `0x{string}`);
console.log(account.address);

const testSponsoredCall = async () => {
  const client = createWalletClient({
    account,
    transport: http(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
    ),
  });
  const counterAddress = config.addresses.counterRelayContext;
  const feeToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const chainId = await client.getChainId();

  const user = account.address;
  console.log(user);

  //encode function data
  const data = encodeFunctionData({
    abi: counterAbi,
    functionName: "increment",
  });

  const request: CallWithSyncFeeRequest = {
    chainId: BigInt(chainId),
    target: counterAddress,
    data: data,
    feeToken: feeToken,
    isRelayContext: true,
  };

  const response = await relay.callWithSyncFee(request);
  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
};

testSponsoredCall();
