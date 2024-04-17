/* This script is not running as expected. It is not able to get the chainId from the client*/

import {
  CallWithSyncFeeERC2771Request,
  GelatoRelay,
} from "@gelatonetwork/relay-sdk-viem";
import { createWalletClient, http, encodeFunctionData, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { counterAbi } from "../utils/counterAbi";
import config from "../config/networks/sepolia.json";
const privateKey = process.env.PRIVATE_KEY;

const testSponsoredCallERC2771 = async () => {
  const relay = new GelatoRelay();

  const account = privateKeyToAccount(privateKey as Hex);
  const client = createWalletClient({
    account,
    transport: http(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
    ),
  });
  console.log(account.address);
  const counterAddress = config.addresses.counterERC2771;
  const chainId = await client.getChainId();
  const feeToken = config.addresses.feeToken;

  //encode function data
  const data = encodeFunctionData({
    abi: counterAbi,
    functionName: "increment",
  });

  // populate the relay SDK request body
  const request: CallWithSyncFeeERC2771Request = {
    chainId: BigInt(chainId),
    target: counterAddress,
    data: data,
    user: account.address,
    feeToken: feeToken,
    isRelayContext: true,
  };

  const response = await relay.callWithSyncFeeERC2771(request, client as any);
  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
};

testSponsoredCallERC2771();
