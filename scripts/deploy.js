const hre = require("hardhat");

async function main() {
    const MyContract = await hre.ethers.getContractFactory("MyContract");
    const contract = await MyContract.deploy("Hello, Blockchain!");

    await contract.waitForDeployment();
    console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
