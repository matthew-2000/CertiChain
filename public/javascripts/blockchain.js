let registryContract, nftContract, accessControlContract;
let signer;

/**
 * Carica la configurazione del contratto dal file config.json
 */
async function loadContractConfig() {
    try {
        const response = await fetch("./javascripts/config.json");
        const config = await response.json();

        // Inizializziamo provider e signer
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
 * La funzione verifyCertificate(...) NON restituisce la revokeReason,
 * quindi facciamo una chiamata extra a "certificates(tokenId)" per ottenerla.
 */
async function checkCertificate(tokenId) {
    try {
        await loadContractConfig();
        // Chiamata alla funzione "verifyCertificate(tokenId)"
        // Restituisce [valid, revoked, issuer, institutionName, title, beneficiaryName, dateIssued, ipfsURI]
        const certArray = await registryContract.verifyCertificate(tokenId);

        // Chiamata diretta alla mapping "certificates(tokenId)" per avere revokeReason
        const certInfo = await registryContract.certificates(tokenId);

        // L'oggetto certInfo, essendo una struct, sarà un array con i campi:
        // 0: institutionName
        // 1: certificateTitle
        // 2: beneficiaryName
        // 3: dateIssued
        // 4: ipfsURI
        // 5: revoked
        // 6: revokeReason
        // 7: issuer
        // Se stai usando Hardhat/Ethers 6, potresti accedere a .institutionName, .revokeReason, ecc.
        // ma per coerenza, prendiamo .revokeReason

        return {
            valid: certArray[0],
            revoked: certArray[1],
            issuer: certArray[2],
            institutionName: certArray[3],
            certificateTitle: certArray[4],
            beneficiaryName: certArray[5],
            dateIssued: certArray[6],
            ipfsURI: certArray[7],
            revokeReason: certInfo.revokeReason // questo campo in più
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
        const tokenIds = await registryContract.getUserCertificates(userAddress);
        let nftDetails = [];

        for (let tokenId of tokenIds) {
            const certificate = await checkCertificate(tokenId);
            nftDetails.push({
                tokenId: tokenId.toString(),
                institutionName: certificate.institutionName,
                certificateTitle: certificate.certificateTitle,
                beneficiaryName: certificate.beneficiaryName,
                dateIssued: certificate.dateIssued,
                ipfsURI: certificate.ipfsURI,
                revoked: certificate.revoked,
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