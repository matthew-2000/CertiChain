const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy AccessControlManager
    const AccessControlManager = await hre.ethers.getContractFactory("AccessControlManager");
    const accessControl = await AccessControlManager.deploy();
    await accessControl.waitForDeployment();
    console.log("AccessControlManager deployed at:", await accessControl.getAddress());

    // Deploy CertificateNFT
    const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
    const nftContract = await CertificateNFT.deploy(deployer.address);
    await nftContract.waitForDeployment();
    console.log("CertificateNFT deployed at:", await nftContract.getAddress());

    // Deploy CertificateRegistry with references to AccessControlManager and CertificateNFT
    const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
    const registry = await CertificateRegistry.deploy(
        await accessControl.getAddress(),
        await nftContract.getAddress()
    );
    await registry.waitForDeployment();
    console.log("CertificateRegistry deployed at:", await registry.getAddress());

    // Trasferisci la proprietà del contratto NFT al Registry, così può mintare certificati
    await nftContract.transferOwnership(await registry.getAddress());
    console.log("CertificateNFT ownership transferred to CertificateRegistry.");

    // Scrittura della configurazione in un file JSON per l'interazione frontend
    const config = {
        certificateRegistryAddress: await registry.getAddress(),
        certificateNFTAddress: await nftContract.getAddress(),
        accessControlAddress: await accessControl.getAddress(),
        registryABI: (await hre.artifacts.readArtifact("CertificateRegistry")).abi,
        nftABI: (await hre.artifacts.readArtifact("CertificateNFT")).abi,
        accessControlABI: (await hre.artifacts.readArtifact("AccessControlManager")).abi
    };

    const configPath = path.resolve(__dirname, "../public/javascripts/config.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
    console.log("Configurazione salvata in public/javascripts/config.json");
}

main().catch((error) => {
    console.error("Errore durante il deploy:", error);
    process.exitCode = 1;
});