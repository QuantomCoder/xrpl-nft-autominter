# xrpl-nft-autominter

A TypeScript/JavaScript package to mint NFTs on XRP Ledger in Node.js without IPFS logic.

# Importance and Implementation

## Importance

The `xrpl-nft-autominter` is built on the top of `xrpl` package and it provides a straightforward solution for minting NFTs on the XRP Ledger without the complexity of IPFS integration. This simplifies the process of creating and managing NFTs on a robust XRP Ledger, leveraging cloud storage for file management and Pinata for metadata handling.

Key features include:

- **Simplicity**: Easily mint NFTs using Node.js with minimal setup.
- **Integration**: Seamless integration with AWS S3 for file storage and retrieval.
- **Customization**: Flexible options for specifying XRP network, transfer fees, taxonomy, and other parameters.
- **Security**: Securely manage wallet credentials for minting operations.

## Implementation

Visit below to understand the workflow
or contact at `umeir366@gmail.com`

### Installation

To start using `xrpl-nft-autominter`, install it via npm:

```bash
npm install xrpl-nft-autominter
```

# How to use this?

    First, import the function to mint an NFT:

```javascript
import { MintThrougCloud } from "xrpl-nft-autominter";
```
    or using CommonJS:

```javascript
const { MintThrougCloud } = require("xrpl-nft-autominter");
```

#Types to use

Ensure these types are used to mint an NFT:

```javascript
interface S3BucketConnectionAttributes {
  accessKeyId: string, 
  secretAccessKey: string,
  region: string
}

interface S3BucketObjectRetrievalAttributes {
  Bucket: string, 
  Key: string 
}

interface PinataConfigAttributes {
  PinataToken: string,
  pinata_api_key: string,
  pinata_secret_api_key: string
}

interface MintingAccountDetails {
  MINTING_ACCOUNT_WALLET_ADDRESS: string,
  MINTING_ACCOUNT_SECRET_KEY: string
}

```

The MintThroughCloud function returns a string which represents your NFT token ID upon successful minting.


```javascript
const s3Connection: S3BucketConnectionAttributes = {
  accessKeyId: "Your S3 Access Key Id",
  secretAccessKey: "Your S3 Access Key Secret",
  region: "Your S3 Region",
};

const pinataCredentials: PinataConfigAttributes = {
  PinataToken: "Your Pinata Token",
  pinata_api_key: "Your Pinata API Key",
  pinata_secret_api_key: "Your Pinata API Secret",
};

const file: S3BucketObjectRetrievalAttributes = {
  Bucket: "Your Bucket Name",
  Key: "Path to File",
};

const json: S3BucketObjectRetrievalAttributes = {
  Bucket: "Your Bucket Name",
  Key: "Path to File",
};

const XRP_NETWORK: string = "Testnet or Mainnet URL";

const MintingAccountDetails: MintingAccountDetails = {
  MINTING_ACCOUNT_WALLET_ADDRESS: "Your Minting Account Wallet Address",
  MINTING_ACCOUNT_SECRET_KEY: "Your Minting Account Secret",
};

const nfTokenTaxon: number = "NFT Taxonomy ID"; 
const largeInteger: number = "Large integer on ledger"; 
const transferFee: number = "Transfer fee to set"; 
const flag: number = "Flag to set burnable/transferable properties";

const nftokenID = await MintThroughCloud(
  s3Connection,
  pinataCredentials,
  file,
  json,
  XRP_NETWORK,
  MintingAccountDetails,
  nfTokenTaxon,
  transferFee,
  flag,
  largeInteger
);

```

# Happy Minting 😎

Hope you enjoyed auto minting

# What's Next

Future updates will include features such as minting from local machines and support for various cloud providers besides AWS. Additionally, options for minting with and without JSON metadata will be available.
