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
Visit github to understand the workflow
or contact at `umeir366@gmail.com`

### Installation

To start using `xrpl-nft-autominter`, install it via npm:

```bash
npm install xrpl-nft-autominter

const multer = require('multer')
const upload = multer().single('avatar')

app.post('/profile', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
    } else if (err) {
      // An unknown error occurred when uploading.
    }

    // Everything went fine.
  })
})

