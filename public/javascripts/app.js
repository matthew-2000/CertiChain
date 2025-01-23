const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";  // Sostituisci con l'indirizzo reale del contratto
const contractABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "initialOwner", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" }
        ],
        "name": "balanceOf",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "ownerOf",
        "outputs": [
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "tokenURI",
        "outputs": [
            { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "beneficiary", "type": "address" },
            { "internalType": "string", "name": "_ipfsURI", "type": "string" }
        ],
        "name": "issueCertificate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Connessione a MetaMask
async function connectMetaMask() {
    if (window.ethereum) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            localStorage.setItem('userAddress', address);
            document.getElementById('userAddress').innerText = `Connesso: ${address}`;
            console.log("Utente connesso:", address);

            return signer;
        } catch (error) {
            console.error("Errore durante la connessione:", error);
        }
    } else {
        alert("MetaMask non rilevato. Installa MetaMask per proseguire.");
    }
}

// Funzione per emettere un certificato
async function issueCertificate() {
    const signer = await connectMetaMask();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const beneficiary = document.getElementById('beneficiary').value;
    const ipfsURI = document.getElementById('ipfsURI').value;

    try {
        const tx = await contract.issueCertificate(beneficiary, ipfsURI);
        await tx.wait();
        document.getElementById('issueResult').innerText = `Certificato emesso con successo: ${tx.hash}`;
        console.log("Certificato emesso:", tx.hash);
    } catch (error) {
        console.error("Errore nell'emissione:", error);
        document.getElementById('issueResult').innerText = "Errore nell'emissione.";
    }
}

// Funzione per verificare un certificato
async function checkCertificate() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const tokenId = document.getElementById('certificateId').value;

    try {
        const certificate = await contract.certificates(tokenId);
        document.getElementById('certificateDetails').innerText =
            `IPFS: ${certificate.ipfsURI}, Revoked: ${certificate.revoked}, Reason: ${certificate.revokeReason}, Issuer: ${certificate.issuer}`;
        console.log("Dati certificato:", certificate);
    } catch (error) {
        console.error("Errore nella verifica:", error);
        document.getElementById('certificateDetails').innerText = "Errore nella verifica.";
    }
}

// Funzione per revocare un certificato
async function revokeCertificate() {
    const signer = await connectMetaMask();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tokenId = document.getElementById('revokeId').value;
    const reason = document.getElementById('revokeReason').value;

    try {
        const tx = await contract.revokeCertificate(tokenId, reason);
        await tx.wait();
        document.getElementById('revokeResult').innerText = `Certificato revocato con successo: ${tx.hash}`;
        console.log("Certificato revocato:", tx.hash);
    } catch (error) {
        console.error("Errore nella revoca:", error);
        document.getElementById('revokeResult').innerText = "Errore nella revoca.";
    }
}

async function getUserNFTs() {
    if (!window.ethereum) {
        alert("MetaMask non rilevato.");
        return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const userAddress = localStorage.getItem('userAddress');  // Ottieni l'indirizzo utente

    try {
        // Ottieni il numero di NFT posseduti dall'utente
        const balance = await contract.balanceOf(userAddress);
        console.log("Numero di NFT posseduti:", balance.toString());

        if (balance === 0) {
            document.getElementById('myNft').innerText = "Nessun certificato trovato.";
            return;
        }

        let nftDetails = "";
        for (let i = 0; i < balance; i++) {
            const tokenId = i + 1; // Supponendo che l'ID inizi da 1 e sia incrementale
            const owner = await contract.ownerOf(tokenId);
            if (owner.toLowerCase() === userAddress.toLowerCase()) {
                const tokenURI = await contract.tokenURI(tokenId);
                nftDetails += `Token ID: ${tokenId}, IPFS URI: ${tokenURI}\n`;
            }
        }

        document.getElementById('myNft').innerText = nftDetails || "Nessun certificato trovato.";
    } catch (error) {
        console.error("Errore nel recupero degli NFT:", error);
        document.getElementById('myNft').innerText = "Errore nel recupero degli NFT.";
    }
}

// Event listeners per i pulsanti
document.getElementById('connectBtn').addEventListener('click', connectMetaMask);
document.getElementById('issueCertificateBtn').addEventListener('click', issueCertificate);
document.getElementById('checkCertificateBtn').addEventListener('click', checkCertificate);
document.getElementById('revokeCertificateBtn').addEventListener('click', revokeCertificate);
document.getElementById('connectBtn').addEventListener('click', connectMetaMask);
document.getElementById('getNFTsBtn').addEventListener('click', getUserNFTs);