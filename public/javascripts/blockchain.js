let contractAddress;
let contractABI;
let signer;
let contract;

async function loadContractConfig() {
    try {
        const response = await fetch('./javascripts/config.json');
        const config = await response.json();
        contractAddress = config.contractAddress;
        contractABI = config.contractABI;
        console.log("Configurazione caricata:", contractAddress);
    } catch (error) {
        console.error("Errore nel caricamento della configurazione:", error);
    }
}

async function initBlockchain() {
    await loadContractConfig();

    if (!window.ethereum) {
        alert("MetaMask non rilevato. Installa MetaMask per proseguire.");
        return;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
    }  catch (error) {
        console.error("Errore durante la connessione:", error);
    }
}

async function connectWallet() {
    await initBlockchain();
    const address = await signer.getAddress();
    localStorage.setItem('userAddress', address);
    return address;
}

async function issueCertificate(beneficiary, ipfsURI) {
    try {
        const tx = await contract.issueCertificate(beneficiary, ipfsURI);
        await tx.wait();
        return tx.hash;
    } catch (error) {
        throw new Error("Errore nell'emissione: " + error.message);
    }
}

async function checkCertificate(tokenId) {
    try {
        return await contract.certificates(tokenId);
    } catch (error) {
        throw new Error("Errore nella verifica: " + error.message);
    }
}

async function revokeCertificate(tokenId, reason) {
    try {
        const tx = await contract.revokeCertificate(tokenId, reason);
        await tx.wait();
        return tx.hash;
    } catch (error) {
        throw new Error("Errore nella revoca: " + error.message);
    }
}

async function getUserNFTs() {
    const userAddress = localStorage.getItem('userAddress');
    try {
        const balance = await contract.balanceOf(userAddress);
        let nftDetails = "";

        for (let i = 0; i < balance; i++) {
            const tokenId = i + 1;
            const tokenURI = await contract.tokenURI(tokenId);
            nftDetails += `Token ID: ${tokenId}, IPFS URI: ${tokenURI}\n`;
        }
        return nftDetails || "Nessun certificato trovato.";
    } catch (error) {
        throw new Error("Errore nel recupero degli NFT: " + error.message);
    }
}