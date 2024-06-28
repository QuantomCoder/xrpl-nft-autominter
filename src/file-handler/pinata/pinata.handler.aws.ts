import { S3BucketConnectionAttributes, S3BucketObjectRetrivalAttributes, PinataConfigAttributes } from '../../types/config'
import * as AWS from 'aws-sdk';
import PinataAPi from '../service/pinata.api';

class PinataHandler extends PinataAPi {

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

    protected async uploadFile(fileKeys: S3BucketObjectRetrivalAttributes, s3Conection: S3BucketConnectionAttributes, pinataCredientials: PinataConfigAttributes) {
        try {
            AWS.config.update(s3Conection
            );
            let s3 = new AWS.S3()
            const fileStream = s3
                .getObject({ Bucket: fileKeys.Bucket, Key: fileKeys.Key })
                .createReadStream();
            const cid = await this.pinFilesToIPFS(fileStream, pinataCredientials)
            if(cid==false){
                throw new Error()
            }
            const imageIPFSUrl = `https://ipfs.io/ipfs/${cid}`;
            return imageIPFSUrl;
        } catch (err) {
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
            const cid = await this.pinFilesToIPFS(fileStream, pinataCredientials)
            if(cid==false){
                throw new Error()
            }
            const metaUrl = `ipfs/${cid}`;
            return metaUrl;
        } catch (err) {
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
            return false
        }
    }
}
export default PinataHandler