/* This script is not running as expected. It is not able to get the chainId from the client*/

import {
  CallWithSyncFeeERC2771Request,
  CallWithERC2771Request,
  ERC2771Type,
  GelatoRelay,
} from "@gelatonetwork/relay-sdk-viem";
import { createWalletClient, http, encodeFunctionData, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { BytesLike } from "ethers";
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
  const counterAddress = config.addresses.counterRelayContextERC2771;
  const chainId = await client.getChainId();
  const feeToken = config.addresses.feeToken;

  //encode function data
  const data = encodeFunctionData({
    abi: counterAbi,
    functionName: "increment",
  });

  const request: CallWithSyncFeeERC2771Request = {
    chainId: BigInt(chainId),
    target: counterAddress,
    data: data,
    user: account.address,
    feeToken: feeToken,
    isRelayContext: true,
  };

  // sign the Payload and get struct and signature
  const { struct, signature } = await relay.getSignatureDataERC2771(
    request,
    client as any,
    ERC2771Type.CallWithSyncFee
  );

  const response = await relay.callWithSyncFeeERC2771WithSignature(
    struct,
    { feeToken, isRelayContext: true },
    signature
  );
  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
};

testSponsoredCallERC2771();
