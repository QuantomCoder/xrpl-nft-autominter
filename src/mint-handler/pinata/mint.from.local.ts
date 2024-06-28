import { NFTokenMint, convertStringToHex, Client, Wallet, TransactionMetadata } from 'xrpl';
import PinataHandler from '../../file-handler/pinata/pinata.handler.local';
import { PinataConfigAttributes } from '../../types/config';
import { MINTINGACCOUNTDETAILS } from '../../types/mint';
class LocalMint extends PinataHandler {
    public localMintWithJson = async (pinataCredientials: PinataConfigAttributes, filePath: string, jsonPath: string, XRP_NETWORK: string, MINTINGACCOUNTDETAILS: MINTINGACCOUNTDETAILS, NFTaxon: number, TransferFee: number, flag: number, LARGE_INTEGER: number) => {
        try {
            let uri = await this.getMetaUriFromLocal(pinataCredientials, filePath, jsonPath);
            if (uri == false) {
                throw new Error()
            }
            const mintPayload: NFTokenMint = {
                TransactionType: "NFTokenMint",
                Account: MINTINGACCOUNTDETAILS.MINTING_ACCOUNT_WALLET_ADDRESS,
                TransferFee: Number(TransferFee) * 1000,
                NFTokenTaxon: NFTaxon,
                Flags: flag,
                URI: convertStringToHex(String(uri)),
                LastLedgerSequence: LARGE_INTEGER
            };
            const meta = await this.mintUsingSeed(mintPayload, XRP_NETWORK, MINTINGACCOUNTDETAILS.MINTING_ACCOUNT_SECRET_KEY)
            return meta
        }
        catch (err) {
            return false
        }
    }
    protected async mintUsingSeed(
        mintPayload: NFTokenMint, XRP_NETWORK: string, MINTING_ACCOUNT_SECRET_KEY: string
    ): Promise<boolean | string> {
        const client = new Client(XRP_NETWORK);
        await client.connect();
        try {
            const hotWallet = Wallet.fromSeed(MINTING_ACCOUNT_SECRET_KEY);
            const cstPreparedOffer = await client.autofill(mintPayload);
            const tsSignedOffer = hotWallet.sign(cstPreparedOffer);
            const tsResultOffer = await client.submitAndWait(
                tsSignedOffer.tx_blob
            );
            const meta = tsResultOffer.result.meta as TransactionMetadata;
            if (meta?.TransactionResult === "tesSUCCESS") {
                if (meta && typeof meta === "object" && "nftoken_id" in meta && typeof meta.nftoken_id === "string") {
                    return meta.nftoken_id
                }
            }
            await client.disconnect();
            return true;
        } catch (err: any | Error) {
            await client.disconnect();
            return false;
        }
    }
}
const Mint1 = new LocalMint()
export const localMintWithJson = Mint1.localMintWithJson
export const getUriUsingLocalMachine = Mint1.getMetaUriFromLocal