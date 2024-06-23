import { S3BucketConnectionAttributes, S3BucketObjectRetrivalAttributes, PinataConfigAttributes } from '../types/config'
import * as AWS from 'aws-sdk';
import FormData from 'form-data';
import axios from 'axios';
import * as fs from "fs"
// (AWS as any).suppress = true;
class PinataHandler {
    public fileAndJsonOnCloud = async (s3Conection: S3BucketConnectionAttributes, pinataCredientials: PinataConfigAttributes, file: S3BucketObjectRetrivalAttributes, json: S3BucketObjectRetrivalAttributes) => {
        const fileLink = await this.uploadFile(file, s3Conection, pinataCredientials)
        if (typeof fileLink == "string") {
            this.updateJsonOnBucket(json, s3Conection, fileLink)
        }
        else if (typeof fileLink == "boolean") {
            return
        }
        const jsonCID = await this.uploadJson(json, s3Conection, pinataCredientials)
        return jsonCID
    }
    public getMetaUriFromLocal=async ( pinataCredientials: PinataConfigAttributes, filePath: string, jsonPath: string) => {
        const fileUri = await this.fileUploadFromLocal(filePath, pinataCredientials)
        const metaUri = await this.updateAndUploadJsonFromLocal(jsonPath, pinataCredientials,fileUri)
        return metaUri
    }
    protected async uploadFile(fileKeys: S3BucketObjectRetrivalAttributes, s3Conection: S3BucketConnectionAttributes, pinataCredientials: PinataConfigAttributes) {
        try {
            AWS.config.update(s3Conection
            );
            let s3 = new AWS.S3()
            const fileStream = s3
                .getObject({ Bucket: fileKeys.Bucket, Key: fileKeys.Key })
                .createReadStream();
            const fileNameSplitted = fileKeys.Key.split('/');
            const filePath = fileNameSplitted[fileNameSplitted.length - 1];
            const formData = new FormData();
            formData.append("file", fileStream, {
                filepath: filePath,
            });
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
                    Authorization: `Bearer ${pinataCredientials.PinataToken}`,
                },
            });

            const imageIPFSUrl = `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
            return imageIPFSUrl;
        } catch (err) {
            console.error("Error uploading image to Pinata:", err);
            return false
        }
    }
    protected async uploadJson(fileKeys: S3BucketObjectRetrivalAttributes, s3Conection: S3BucketConnectionAttributes, pinataCredientials: PinataConfigAttributes) {
        try {
            AWS.config.update(s3Conection
            );
            let s3 = new AWS.S3()
            const fileStream = s3
                .getObject({ Bucket: fileKeys.Bucket, Key: fileKeys.Key })
                .createReadStream();
            const jsonPathSplitted = fileKeys.Key.split('/');
            const jsonPath = jsonPathSplitted[jsonPathSplitted.length - 1];
            const formData = new FormData();
            formData.append("file", fileStream, {
                filepath: jsonPath,
            });

            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxBodyLength: Infinity,
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
                    Authorization: `Bearer ${pinataCredientials.PinataToken}`,
                },
            });

            const metaUrl = `ipfs/${response.data.IpfsHash}`;
            return metaUrl;
        } catch (err) {
            console.error("Error uploading image to Pinata:", err);
            return false
        }
    }
    protected async updateJsonOnBucket(fileKeys: S3BucketObjectRetrivalAttributes, s3Conection: S3BucketConnectionAttributes, fileCid: string) {
        try {
            AWS.config.update(s3Conection
            );
            let s3 = new AWS.S3()
            const getObjectResponse = await s3.getObject(fileKeys).promise();

            if (getObjectResponse && getObjectResponse.Body) {
                const jsonContent = JSON.parse(getObjectResponse.Body.toString("utf-8"));
                jsonContent.image = fileCid;

                const updatedObjectParams = {
                    Bucket: fileKeys.Bucket,
                    Key: fileKeys.Key,
                    Body: JSON.stringify(jsonContent, null, 2),
                    ContentType: "application/json",
                };

                await s3.upload(updatedObjectParams).promise();
                return true;
            }
        } catch (err) {
            console.error("Error updating JSON on bucket:", err);
            return false
        }
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