import type {
    Chain,
    Client,
    ClientConfig,
    Transport,
    WalletClientConfig
} from "viem"
import { createClient } from "viem"
import { type SmartAccount } from "../accounts/types"
import { type SponsorUserOperationMiddleware } from "../actions/smartAccount/prepareUserOperationRequest"
import type { Prettify } from "../types/"
import { type BundlerRpcSchema } from "../types/bundler"
import {
    type SmartAccountActions,
    smartAccountActions
} from "./decorators/smartAccount"
import type { DefaultEntryPoint, EntryPoint } from "../types/entrypoint"

/**
 * TODO:
 *  - Add docs
 *  - Fix typing, 'accounts' is required to signMessage, signTypedData, signTransaction, but not needed here, since account is embedded in the client
 */
export type SmartAccountClient<
    entryPoint extends EntryPoint = DefaultEntryPoint,
    transport extends Transport = Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends SmartAccount<entryPoint> | undefined =
        | SmartAccount<entryPoint>
        | undefined
> = Prettify<
    Client<
        transport,
        chain,
        account,
        BundlerRpcSchema<entryPoint>,
        SmartAccountActions<entryPoint, chain, account>
    >
>

export type SmartAccountClientConfig<
    entryPoint extends EntryPoint = DefaultEntryPoint,
    transport extends Transport = Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends SmartAccount<entryPoint> | undefined =
        | SmartAccount<entryPoint>
        | undefined
> = Prettify<
    Pick<
        ClientConfig<transport, chain, account>,
        "cacheTime" | "chain" | "key" | "name" | "pollingInterval" | "transport"
    > & {
        account?: account
    } & SponsorUserOperationMiddleware<entryPoint>
>

/**
 * Creates a EIP-4337 compliant Bundler Client with a given [Transport](https://viem.sh/docs/clients/intro.html) configured for a [Chain](https://viem.sh/docs/clients/chains.html).
 *
 * - Docs: https://docs.pimlico.io/permissionless/reference/clients/smartAccountClient
 *
 * A Bundler Client is an interface to "erc 4337" [JSON-RPC API](https://eips.ethereum.org/EIPS/eip-4337#rpc-methods-eth-namespace) methods such as sending user operation, estimating gas for a user operation, get user operation receipt, etc through Bundler Actions.
 *
 * @param parameters - {@link WalletClientConfig}
 * @returns A Bundler Client. {@link SmartAccountClient}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const smartAccountClient = createSmartAccountClient({
 *   chain: mainnet,
 *   transport: http(BUNDLER_URL),
 * })
 */

export function createSmartAccountClient<
    TTransport extends Transport,
    entryPoint extends EntryPoint = DefaultEntryPoint,
    TChain extends Chain | undefined = undefined,
    TSmartAccount extends SmartAccount<entryPoint> | undefined = undefined
>(
    parameters: SmartAccountClientConfig<
        entryPoint,
        TTransport,
        TChain,
        TSmartAccount
    >
): SmartAccountClient<entryPoint, TTransport, TChain, TSmartAccount> {
    const {
        key = "Account",
        name = "Smart Account Client",
        transport
    } = parameters
    const client = createClient({
        ...parameters,
        key,
        name,
        transport: (opts) => transport({ ...opts, retryCount: 0 }),
        type: "smartAccountClient"
    })

    return client.extend(
        smartAccountActions<entryPoint>({
            sponsorUserOperation: parameters.sponsorUserOperation
        })
    ) as SmartAccountClient<entryPoint, TTransport, TChain, TSmartAccount>
}
