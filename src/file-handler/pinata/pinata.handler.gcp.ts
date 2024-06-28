import { PinataConfigAttributes, GcsBucketObjectRetrivalAttributes } from '../../types/config'
import { Storage } from "@google-cloud/storage"
import PinataAPi from '../service/pinata.api';

class PinataHandler extends PinataAPi {

    public fileAndJsonOnCloud = async (gcpServiceAccountJsonPath: string, pinataCredientials: PinataConfigAttributes, file: GcsBucketObjectRetrivalAttributes, json: GcsBucketObjectRetrivalAttributes) => {
        try {
            const fileLink = await this.uploadFile(file, gcpServiceAccountJsonPath, pinataCredientials)
            if (typeof fileLink == "string") {
                const jsonCID = await this.uploadJson(json, gcpServiceAccountJsonPath, pinataCredientials, fileLink)
                return jsonCID
            }
            throw new Error()
        } catch (err) {
            return false
        }

    }

    protected async uploadFile(fileKeys: GcsBucketObjectRetrivalAttributes, gcpServiceAccountJsonPath: string, pinataCredientials: PinataConfigAttributes) {
        try {
            const storage = new Storage({ keyFilename: gcpServiceAccountJsonPath })
            let fileStream = storage.bucket(fileKeys.bucketName).file(fileKeys.fileName).createReadStream();
            const cid = await this.pinFilesToIPFS(fileStream, pinataCredientials)
            if (cid == false) {
                throw new Error()
            }
            const imageIPFSUrl = `https://ipfs.io/ipfs/${cid}`;
            return imageIPFSUrl;
        } catch (err) {
            return false
        }
    }

    protected async uploadJson(fileKeys: GcsBucketObjectRetrivalAttributes, gcpServiceAccountJsonPath: string, pinataCredientials: PinataConfigAttributes, fileCid: string) {
        try {
            const storage = new Storage({ keyFilename: gcpServiceAccountJsonPath })
            const [file] = await storage.bucket(fileKeys.bucketName).file(fileKeys.fileName).download();

            let jsonObject = JSON.parse(file.toString('utf8'));
            jsonObject.image = fileCid;
            await storage.bucket(fileKeys.bucketName).file(fileKeys.fileName).save(JSON.stringify(jsonObject, null, 2), {
                contentType: 'application/json',
            });
            let fileStream = storage.bucket(fileKeys.bucketName).file(fileKeys.fileName).createReadStream();
            const cid = await this.pinFilesToIPFS(fileStream, pinataCredientials)
            if (cid == false) {
                throw new Error()
            }
            const metaUrl = `ipfs/${cid}`;
            return metaUrl;
        } catch (err) {
            return false
        }
    }

}
export default PinataHandler