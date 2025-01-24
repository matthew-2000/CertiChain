let registryContract, nftContract, accessControlContract;
let signer;

/**
 * Carica la configurazione del contratto dal file config.json
 */
async function loadContractConfig() {
    try {
        const response = await fetch("./javascripts/config.json");
        const config = await response.json();

        // Salviamo gli indirizzi dei contratti e ABI
        const provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        registryContract = new ethers.Contract(
            config.certificateRegistryAddress,
            config.registryABI,
            signer
        );

        nftContract = new ethers.Contract(
            config.certificateNFTAddress,
            config.nftABI,
            signer
        );

        accessControlContract = new ethers.Contract(
            config.accessControlAddress,
            config.accessControlABI,
            signer
        );

        console.log("Configurazione caricata e contratti pronti.");
    } catch (error) {
        console.error("Errore nel caricamento della configurazione:", error);
    }
}

/**
 * Connette il wallet utente e memorizza l'indirizzo nel localStorage
 */
async function connectWallet() {
    await loadContractConfig();
    try {
        const address = await signer.getAddress();
        localStorage.setItem("userAddress", address);
        return address;
    } catch (error) {
        console.error("Errore nella connessione al wallet:", error);
        throw error;
    }
}

/**
 * Emette un certificato utilizzando CertificateRegistry.sol
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
        const tx = await registryContract.issueCertificate(
            beneficiary,
            institutionName,
            certificateTitle,
            beneficiaryName,
            dateIssued,
            ipfsURI
        );
        await tx.wait();
        return tx.hash;
    } catch (error) {
        throw new Error("Errore nell'emissione del certificato: " + error.message);
    }
}

/**
 * Verifica un certificato ottenendo le informazioni dal contratto Registry.
 */
async function checkCertificate(tokenId) {
    try {
        const cert = await registryContract.verifyCertificate(tokenId);

        return {
            valid: cert[0],
            revoked: cert[1],
            issuer: cert[2],
            institutionName: cert[3],
            certificateTitle: cert[4],
            beneficiaryName: cert[5],
            dateIssued: cert[6],
            ipfsURI: cert[7]
        };
    } catch (error) {
        throw new Error("Errore nella verifica del certificato: " + error.message);
    }
}

/**
 * Revoca un certificato
 */
async function revokeCertificate(tokenId, reason) {
    try {
        const tx = await registryContract.revokeCertificate(tokenId, reason);
        await tx.wait();
        return tx.hash;
    } catch (error) {
        throw new Error("Errore nella revoca del certificato: " + error.message);
    }
}

/**
 * Recupera tutti i certificati dell'utente tramite il contratto NFT
 */
async function getUserNFTs() {
    const userAddress = localStorage.getItem("userAddress");
    try {
        const balance = await nftContract.balanceOf(userAddress);
        let nftDetails = [];

        for (let i = 0; i < balance; i++) {
            const tokenId = await nftContract.tokenOfOwnerByIndex(userAddress, i);
            const certificate = await checkCertificate(tokenId);

            nftDetails.push({
                tokenId: tokenId.toString(),
                institutionName: certificate.institutionName,
                certificateTitle: certificate.certificateTitle,
                beneficiaryName: certificate.beneficiaryName,
                dateIssued: certificate.dateIssued,
                ipfsURI: certificate.ipfsURI,
                revoked: certificate.revoked ? "Yes" : "No",
                issuer: certificate.issuer
            });
        }

        return nftDetails;
    } catch (error) {
        throw new Error("Errore nel recupero degli NFT: " + error.message);
    }
}

/**
 * Controlla se l'utente ha il ruolo di Issuer
 */
async function isUserIssuer() {
    const userAddress = localStorage.getItem("userAddress");
    try {
        const hasRole = await accessControlContract.hasIssuerRole(userAddress);
        return hasRole;
    } catch (error) {
        throw new Error("Errore nel controllo dei ruoli: " + error.message);
    }
}