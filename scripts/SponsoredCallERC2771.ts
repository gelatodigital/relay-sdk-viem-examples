/* This script is not running as expected. It is not able to get the chainId from the client*/

import {
  CallWithERC2771Request,
  GelatoRelay,
} from "@gelatonetwork/relay-sdk-viem";
import { createWalletClient, http, encodeFunctionData, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { Contract, BytesLike } from "ethers";
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
  const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY as string;
  const counterAddress = config.addresses.counterERC2771;
  const chainId = await client.getChainId();

  //encode function data
  const data = encodeFunctionData({
    abi: counterAbi,
    functionName: "increment",
  });

  const relayRequest = {
    user: account.address,
    chainId: BigInt(chainId),
    target: counterAddress,
    data: data as BytesLike,
  } as CallWithERC2771Request;

  const response = await relay.sponsoredCallERC2771(
    relayRequest,
    client as any,
    GELATO_RELAY_API_KEY
  );
  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
};

testSponsoredCallERC2771();
