const keccak256 = require("keccak256");
const { default: MerkleTree } = require("merkletreejs");
const fs = require("fs");

//hardhat local node addresses from 0 to 3
const address = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  //"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
];

//  Hashing All Leaf Individual
//leaves is an array of hashed addresses (leaves of the Merkle Tree).
const leaves = address.map((leaf) => keccak256(leaf));

// Constructing Merkle Tree
const tree = new MerkleTree(leaves, keccak256, {
  sortPairs: true,
});

//  Utility Function to Convert From Buffer to Hex
const bufferToHex = (x) => "0x" + x.toString("hex");

// Get Root of Merkle Tree
console.log(`Here is Root Hash: ${bufferToHex(tree.getRoot())}`);

let data = [];
// Pushing all the proof and leaf in data array
address.forEach((address) => {
    const leaf = keccak256(address);
  
    const proof = tree.getProof(leaf);
  
    let tempData = [];
  
    proof.map((x) => tempData.push(bufferToHex(x.data)));
  
    data.push({
      address: address,
      leaf: bufferToHex(leaf),
      proof: tempData,
    });
  });
  
  // Create WhiteList Object to write JSON file
  
  let whiteList = {
    whiteList: data,
  };
  
  //  Stringify whiteList object and formating
  const metadata = JSON.stringify(whiteList, null, 2);
  
  // Write whiteList.json file in root dir
  fs.writeFile(`whiteList.json`, metadata, (err) => {
    if (err) {
      throw err;
    }
  });

  //////////////////////////////////////////////////////////
//   import { ethers } from 'ethers'
// import { MerkleTree } from 'merkletreejs'

// // Your whitelist from database
// const whitelist = [
//   '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
//   '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
//   '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
//   '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
//   '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
// ]

// const { keccak256 } = ethers.utils
// let leaves = whitelist.map((addr) => keccak256(addr))
// const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })

// // We need to store this hash in NFT contract
// const merkleRootHash = merkleTree.getHexRoot()