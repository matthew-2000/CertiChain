const hre = require("hardhat");

async function main() {
    // Otteniamo i signers (deployer)
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);

    // Prendiamo il contratto compilato
    const CertificateManager = await hre.ethers.getContractFactory("CertificateManager");

    // Deployiamo il contratto passando il proprietario iniziale (deployer.address)
    const certificateManager = await CertificateManager.deploy(deployer.address);

    // Attendiamo il completamento del deploy
    await certificateManager.waitForDeployment();

    // Recuperiamo l'indirizzo del contratto deployato
    const contractAddress = await certificateManager.getAddress();
    console.log("CertificateManager deployed to:", contractAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });