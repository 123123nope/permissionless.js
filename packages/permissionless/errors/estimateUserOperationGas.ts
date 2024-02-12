import { BaseError } from "viem"
import type { EstimateUserOperationGasParameters } from "../actions/bundler/estimateUserOperationGas"
import { prettyPrint } from "./utils"
import type { DefaultEntryPoint, EntryPoint } from "../types/entrypoint"

export type EstimateUserOperationGasErrorType<
    entryPoint extends EntryPoint = DefaultEntryPoint
> = EstimateUserOperationGasError<entryPoint> & {
    name: "EstimateUserOperationGasError"
}
export class EstimateUserOperationGasError<
    entryPoint extends EntryPoint = DefaultEntryPoint
> extends BaseError {
    override cause: BaseError

    override name = "EstimateUserOperationGasError"

    constructor(
        cause: BaseError,
        {
            userOperation,
            entryPoint,
            docsPath
        }: EstimateUserOperationGasParameters<entryPoint> & {
            docsPath?: string
        }
    ) {
        const prettyArgs = prettyPrint({
            sender: userOperation.sender,
            nonce: userOperation.nonce,
            initCode: userOperation.initCode,
            callData: userOperation.callData,
            callGasLimit: userOperation.callGasLimit,
            verificationGasLimit: userOperation.verificationGasLimit,
            preVerificationGas: userOperation.preVerificationGas,
            maxFeePerGas: userOperation.maxFeePerGas,
            maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
            paymasterAndData: userOperation.paymasterAndData,
            signature: userOperation.signature,
            entryPoint
        })

        super(cause.shortMessage, {
            cause,
            docsPath,
            metaMessages: [
                ...(cause.metaMessages ? [...cause.metaMessages, " "] : []),
                "Estimate Gas Arguments:",
                prettyArgs
            ].filter(Boolean) as string[]
        })
        this.cause = cause
    }
}
