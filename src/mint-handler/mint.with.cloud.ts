import { NFTokenMint, convertStringToHex,Client,Wallet,TransactionMetadata} from 'xrpl';
import PinataHandler from '../file-handler/pinata.handler';
import { PinataConfigAttributes, S3BucketConnectionAttributes, S3BucketObjectRetrivalAttributes } from '../types/config';
import { MINTINGACCOUNTDETAILS } from '../types/mint';
class Mint extends PinataHandler {
    public cloadMintWithJson = async (s3Conection: S3BucketConnectionAttributes, pinataCredientials: PinataConfigAttributes, file: S3BucketObjectRetrivalAttributes, json: S3BucketObjectRetrivalAttributes, XRP_NETWORK: string, MINTINGACCOUNTDETAILS: MINTINGACCOUNTDETAILS, NFTaxon: number, TransferFee: number, flag: number, LARGE_INTEGER: number) => {
        let uri = await this.fileAndJsonOnCloud(s3Conection, pinataCredientials, file, json);
        const mintPayload: NFTokenMint = {
            TransactionType: "NFTokenMint",
            Account: MINTINGACCOUNTDETAILS.MINTING_ACCOUNT_WALLET_ADDRESS,
            TransferFee: Number(TransferFee) * 1000,
            NFTokenTaxon: NFTaxon,
            Flags: flag,
            URI: convertStringToHex(uri),
            LastLedgerSequence: LARGE_INTEGER
        };
        const meta=await this.mintUsingSeed(mintPayload,XRP_NETWORK,MINTINGACCOUNTDETAILS.MINTING_ACCOUNT_SECRET_KEY)
        return meta
    }
    protected async mintUsingSeed(
        mintPayload: NFTokenMint,XRP_NETWORK:string,MINTING_ACCOUNT_SECRET_KEY:string
    ): Promise<boolean|string> {
        const client = new Client(XRP_NETWORK);
        await client.connect();
        try {
            const hot_wallet = Wallet.fromSeed(MINTING_ACCOUNT_SECRET_KEY);
            const cst_prepared_offer = await client.autofill(mintPayload);
            const ts_signed_offer = hot_wallet.sign(cst_prepared_offer);
            const ts_result_offer= await client.submitAndWait(
                ts_signed_offer.tx_blob
            );
            const meta = ts_result_offer.result.meta as TransactionMetadata;
            if (meta?.TransactionResult === "tesSUCCESS"){
                if (meta && typeof meta === "object" && "nftoken_id" in meta && typeof meta.nftoken_id === "string"){
                    return meta.nftoken_id
                }
            }
            await client.disconnect();
            return true;
        } catch (err: any | Error) {
            await client.disconnect();
            console.log(err.message);
            return false;
        }
    }
}
const Mint1=new Mint()
export const MintThrougCloud=Mint1.cloadMintWithJson
export const getUri=Mint1.fileAndJsonOnCloud