export interface S3BucketConnectionAttributes{
    accessKeyId:string,
    secretAccessKey:string,
    region:string
}
export interface S3BucketObjectRetrivalAttributes{
    Bucket:string, // This is the bucket name
    Key:string // This is path to that specific object
}
export interface PinataConfigAttributes{
    PinataToken:string,
    pinata_api_key:string,
    pinata_secret_api_key:string
}
export interface GcsBucketObjectRetrivalAttributes{
    bucketName:string, // This is the bucket name
    fileName:string // This is path to that specific object
}
export const PINATA_API_PINFILETOIPFS:string

