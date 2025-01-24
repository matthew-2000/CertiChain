let contractAddress;
let contractABI;
let signer;
let contract;

/**
 * Carica il file di configurazione (config.json)
 * che contiene contractAddress e contractABI.
 */
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

/**
 * Inizializza la connessione a MetaMask (o altro wallet) tramite Ethers.
 * Richiama loadContractConfig(), crea provider + signer + contratto.
 */
async function initBlockchain() {
    await loadContractConfig();

    if (!window.ethereum) {
        alert("MetaMask non rilevato. Installa MetaMask per proseguire.");
        return;
    }

    try {
        // Ethers v6: BrowserProvider
        const provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("Connessione inizializzata. Contratto pronto.");
    } catch (error) {
        console.error("Errore durante la connessione:", error);
    }
}

/**
 * Connette il wallet dell'utente e salva l'indirizzo in localStorage
 */
async function connectWallet() {
    await initBlockchain();
    const address = await signer.getAddress();
    localStorage.setItem('userAddress', address);
    return address;
}

/**
 * Emette un nuovo certificato richiamando la funzione issueCertificate(...)
 * con i campi aggiuntivi (in base alla nuova firma del tuo smart contract).
 */
async function issueCertificate(
    beneficiary,
    institutionName,
    certificateTitle,
    beneficiaryName,
    dateIssued,
    ipfsURI
) {
    try {
        // Chiama la nuova funzione con più parametri
        const tx = await contract.issueCertificate(
            beneficiary,
            institutionName,
            certificateTitle,
            beneficiaryName,
            dateIssued,
            ipfsURI
        );
        await tx.wait(); // attendi la conferma on-chain
        return tx.hash;  // ritorna l'hash della tx
    } catch (error) {
        throw new Error("Errore nell'emissione: " + error.message);
    }
}

/**
 * Legge i dati di un certificato on-chain.
 * Se utilizzi `certificates(tokenId)` come mapping public,
 * Ethers ti restituirà un array/oggetto con i campi dello struct.
 *
 * Esempio: struct CertificateInfo {
 *   string institutionName;
 *   string certificateTitle;
 *   string beneficiaryName;
 *   string dateIssued;
 *   string ipfsURI;
 *   bool revoked;
 *   string revokeReason;
 *   address issuer;
 * }
 */
async function checkCertificate(tokenId) {
    await initBlockchain();
    try {
        const certificate = await contract.certificates(tokenId);
        // In Ethers v6, potresti dover accedere con certificate[0], certificate[1], ecc.
        // oppure certificate.institutionName, se le note ABI lo permettono.
        // Dipende da come è generata l'ABI per lo struct "public".

        return {
            institutionName: certificate.institutionName,
            certificateTitle: certificate.certificateTitle,
            beneficiaryName: certificate.beneficiaryName,
            dateIssued: certificate.dateIssued,
            ipfsURI: certificate.ipfsURI,
            revoked: certificate.revoked,
            revokeReason: certificate.revokeReason,
            issuer: certificate.issuer
        };
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

/**
 * Recupera gli NFT di un utente (certificati).
 * Se il tuo contratto estende ERC721Enumerable, puoi usare tokenOfOwnerByIndex.
 * Altrimenti potresti scorrere un contatore di tokenId e testare l'owner,
 * ma non è ottimale se i tokenId non sono 1..N consecutivi o se l'utente ne possiede pochi.
 */
async function getUserNFTs() {
    const userAddress = localStorage.getItem('userAddress');
    try {
        const balance = await contract.balanceOf(userAddress);
        let nftDetails = [];

        for (let i = 0; i < balance; i++) {
            const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
            const certificate = await checkCertificate(tokenId);

            nftDetails.push({
                tokenId: tokenId.toString(),
                institutionName: certificate.institutionName,
                certificateTitle: certificate.certificateTitle,
                beneficiaryName: certificate.beneficiaryName,
                dateIssued: certificate.dateIssued,
                ipfsURI: certificate.ipfsURI,
                revoked: certificate.revoked,
                revokeReason: certificate.revokeReason || 'N/A',
                issuer: certificate.issuer
            });
        }

        return nftDetails;
    } catch (error) {
        throw new Error("Errore nel recupero degli NFT: " + error.message);
    }
}