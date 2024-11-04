// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

 const ROOT_HASH = "0x12014c768bd10562acd224ac6fb749402c37722fab384a6aecc8f91aa7dc51cf";


module.exports = buildModule("MerkleProofContractModule", (m) => {


  const merkleProofContract = m.contract("MerkleProofContract", [ROOT_HASH]);

  return { merkleProofContract };
});

//contract Address 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512