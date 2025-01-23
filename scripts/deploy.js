const hre = require("hardhat");
const fs = require('fs');
const contractJson = require("../artifacts/contracts/CertificateManager.sol/CertificateManager.json");
const path = require("path");

async function main() {
    // Otteniamo i signers (deployer)
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);

    // Prendiamo il contratto compilato
    const CertificateManager = await hre.ethers.getContractFactory("CertificateManager");

    // Deployiamo il contratto passando il proprietario iniziale (deployer.address)
    const certificateManager = await CertificateManager.deploy(deployer.address);

    const config = {
        contractAddress: await certificateManager.getAddress(),
        contractABI: contractJson.abi
    };

    const configPath = path.resolve(__dirname, '../public/javascripts/config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log("Configurazione salvata in public/javascripts/config.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});