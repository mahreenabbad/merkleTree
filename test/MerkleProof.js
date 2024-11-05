const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("MerkleProof", function () {
  async function runEveryTime() {
    const [owner, addr1, addr2] = await ethers.getSigners(); // Get signers
    const whitelistAddresses = [owner.address, addr1.address]; // Whitelisted addresses
    const leaves = whitelistAddresses.map(addr => keccak256(addr)); // Create leaves from addresses
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true }); // Create Merkle tree
    const rootHash = tree.getHexRoot(); // Get root hash

    const uri = "nft uri"; // NFT URI

    const MerkleTreeContract = await ethers.getContractFactory("MerkleProofContract");
    const merkleContract = await MerkleTreeContract.deploy(rootHash); // Deploy contract with root hash

    return { merkleContract, uri, tree, addr1, addr2 ,whitelistAddresses,rootHash}; // Return values for tests
  }

  describe("Only whitelisted can mint", function () {
    
    it("Should fail for non-whitelisted address", async function () {
      const { merkleContract, uri, tree, addr2 } = await loadFixture(runEveryTime);
      
      const leaf = keccak256(addr2.address); //  leaf for addr2
      const proof = tree.getHexProof(leaf); //  proof for addr2 (which is not whitelisted)

      // Expect minting to fail for addr2 (non-whitelisted address)
      await expect(
        merkleContract.connect(addr2).mintNFT(addr2.address, uri, proof)
      ).to.be.revertedWith("Not WhiteListed Address");
    });

    it("Should fail for whitelisted address with incorrect proof", async function () {
      const { merkleContract, uri, tree, addr1 } = await loadFixture(runEveryTime);
      
      const invalidLeaf = keccak256("someotheraddress"); // Generate a leaf for an incorrect address
      const invalidProof = tree.getHexProof(invalidLeaf); // Generate an invalid proof

      // Expect minting to fail for addr1 with an invalid proof
      await expect(
        merkleContract.connect(addr1).mintNFT(addr1.address, uri, invalidProof)
      ).to.be.revertedWith("Not WhiteListed Address");
    });

    //it should if address is not whitelisted 
    it("Should fail if address is not whitelisted", async function(){
      const { merkleContract, uri, tree, addr2 ,addr1} = await loadFixture(runEveryTime);

      const leaf = keccak256(addr2.address); //  leaf for addr2
      const proof = tree.getHexProof(leaf);
      // Expect minting to fail for addr2 (non-whitelisted address)
      await expect(
        merkleContract.connect(addr1).mintNFT(addr2.address, uri, proof)
      ).to.be.revertedWith("Not WhiteListed Address");
    })
    
    it('Should return correct name and symbol', async function () {
      const { merkleContract} = await loadFixture(runEveryTime);
      expect(await merkleContract.name()).to.equal(
        'Student Certificate'
      );
      expect(await merkleContract.symbol()).to.equal('SCT');
    });

    /////////////////////////
    it("Should allow  whitelisted address to mint NFT", async function () {
      const { merkleContract, uri, tree, addr1 } = await loadFixture(runEveryTime);

      const leaf = keccak256(addr1.address); // leaf for addr1
      const proof = tree.getHexProof(leaf); // proof for addr1 (which is whitelisted)

      // Expect minting to succeed for addr1 (whitelisted address)
      await expect(
        merkleContract.connect(addr1).mintNFT(addr1.address, uri, proof)
      ).to.emit(merkleContract, "NftMinted").withArgs(addr1.address, anyValue); ;

      

    
  });

})})
