import { PinataConfigAttributes } from '../../types/config'
import * as fs from "fs"
import PinataAPi from '../service/pinata.api';

class PinataHandler extends PinataAPi {

    public getMetaUriFromLocal = async (pinataCredientials: PinataConfigAttributes, filePath: string, jsonPath: string) => {
        try {
            const fileUri = await this.fileUploadFromLocal(filePath, pinataCredientials)
            if (fileUri == false) {
                throw new Error()
            }
            const metaUri = await this.updateAndUploadJsonFromLocal(jsonPath, pinataCredientials, fileUri)
            if (metaUri == false) {
                throw new Error()
            }
            return metaUri
        }
        catch (err) {
            return false
        }
    }

    protected async fileUploadFromLocal(filePath: string, pinataCredientials: PinataConfigAttributes) {
        try {
            const fileStream = fs.createReadStream(filePath)
            const cid = await this.pinFilesToIPFS(fileStream, pinataCredientials)
            if (cid == false) {
                throw new Error()
            }
            const imageURL = `https://ipfs.io/ipfs/${cid}`;
            return imageURL;
        } catch (err) {
            return false
        }
    }

    protected async updateAndUploadJsonFromLocal(jsonPath: string, pinataCredientials: PinataConfigAttributes, imageUri: string) {
        try {
            const data = await fs.promises.readFile(jsonPath, "utf-8");
            let jsonData;
            try {
                jsonData = JSON.parse(data);
            } catch (parseError) {
                throw new Error()
            }
            jsonData.image = imageUri;
            const updatedJsonData = JSON.stringify(jsonData, null, 2);
            await fs.promises.writeFile(jsonPath, updatedJsonData, "utf-8");
            const fileStream = fs.createReadStream(jsonPath)
            const cid = await this.pinFilesToIPFS(fileStream, pinataCredientials)
            if (cid == false) {
                throw new Error()
            }
            const metaURI = `ipfs/${cid}`;
            return metaURI;
        }
        catch (err) {
            return false
        }
    }
}
export default PinataHandler