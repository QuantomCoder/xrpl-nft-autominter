import { PinataConfigAttributes } from '../../types/config'
import FormData from 'form-data';
import axios from 'axios';
import * as fs from "fs"

class PinataHandler {

    public getMetaUriFromLocal=async ( pinataCredientials: PinataConfigAttributes, filePath: string, jsonPath: string) => {
        const fileUri = await this.fileUploadFromLocal(filePath, pinataCredientials)
        const metaUri = await this.updateAndUploadJsonFromLocal(jsonPath, pinataCredientials,fileUri)
        return metaUri
    }

    protected async fileUploadFromLocal(filePath: string, pinataCredientials: PinataConfigAttributes) {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath), {
            filepath: "image.png",
        });
        const boundary = formData.getBoundary();
        const {
            data: { IpfsHash: cid },
        } = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: Infinity,
            headers: {
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
                Authorization: `Bearer ${pinataCredientials.PinataToken}`,
            },
        });
        const imageURL = `https://ipfs.io/ipfs/${cid}`;
        return imageURL;
    }
    
    protected async updateAndUploadJsonFromLocal(jsonPath: string, pinataCredientials: PinataConfigAttributes, imageUri: string) {
        const data = await fs.promises.readFile(jsonPath, "utf-8");
        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseError) {
            console.error(`Error parsing JSON data: ${parseError}`);
            return false;
        }
        jsonData.image = imageUri;
        const updatedJsonData = JSON.stringify(jsonData, null, 2);
        await fs.promises.writeFile(jsonPath, updatedJsonData, "utf-8");
        const formData = new FormData();
        formData.append("file", fs.createReadStream(jsonPath), {
            filepath: "image.png",
        });
        const boundary = formData.getBoundary();
        const {
            data: { IpfsHash: cid },
        } = await axios.post(`https://api.pinata.cloud/pinning/pinFileToIPFS`, formData, {
            maxBodyLength: Infinity,
            headers: {
                "Content-Type": `multipart/form-data; boundary=${boundary}`,
                Authorization: `Bearer ${pinataCredientials.PinataToken}`
            },
        });
        const metaURI = `ipfs/${cid}`;
        return metaURI;
    }
}
export default PinataHandler