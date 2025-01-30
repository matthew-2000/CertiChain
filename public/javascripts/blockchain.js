let registryContract, nftContract, accessControlContract;
let signer;

/**
 * Carica la configurazione del contratto dal file config.json
 */
async function loadContractConfig() {
    try {
        const response = await fetch("./javascripts/config.json");
        const config = await response.json();

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
 * Connetti il wallet
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
 * Emetti un certificato
 */
async function issueCertificate(beneficiary, secret, ipfsURI) {
    try {
        const hashedSecret = ethers.keccak256(ethers.toUtf8Bytes(secret));
        const tx = await registryContract.issueCertificate(
            beneficiary,
            hashedSecret,
            ipfsURI
        );
        await tx.wait();
        return tx.hash;
    } catch (error) {
        throw new Error("Errore nell'emissione del certificato: " + error.message);
    }
}

/**
 * Verifica un certificato
 */
async function checkCertificate(tokenId, secret) {
    try {
        await loadContractConfig();
        const hashedSecret = ethers.keccak256(ethers.toUtf8Bytes(secret));

        const certArray = await registryContract.verifyCertificate(tokenId, hashedSecret);
        const certInfo = await registryContract.certificates(tokenId);

        if (!certArray.valid) {
            alert(`Il certificato non è valido.`);
        } else {
            return {
                valid: certArray[0],
                revoked: certArray[1],
                ipfsURI: certArray[2],
                revokeReason: certInfo.revokeReason,
                issuer: certInfo.issuer
            };
        }
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
 * Recupera tutti i certificati dell'utente tramite il contratto NFT (senza richiedere subito il segreto)
 */
async function getUserNFTs() {
    const userAddress = localStorage.getItem("userAddress");
    try {
        const tokenIds = await registryContract.getUserCertificates(userAddress);
        let nftDetails = [];

        for (let tokenId of tokenIds) {
            nftDetails.push({
                tokenId: tokenId.toString(),
                verified: false,  // Indica se è stato verificato con il segreto
                ipfsURI: null,
                revoked: null,
                issuer: null,
                revokeReason: null
            });
        }

        return nftDetails;
    } catch (error) {
        throw new Error("Errore nel recupero degli NFT: " + error.message);
    }
}

/**
 * Verifica un certificato solo dopo che l'utente inserisce la parola segreta
 */
async function verifyCertificateDetails(tokenId) {
    const userSecret = prompt(`Inserisci la parola segreta per il certificato con Token ID ${tokenId}:`);

    if (!userSecret) {
        alert(`Verifica annullata.`);
        return;
    }

    try {
        // Recuperiamo il certificato usando il segreto
        const certificate = await checkCertificate(tokenId, userSecret);

        if (!certificate.valid) {
            alert(`Il certificato non è valido.`);
            return;
        }

        // Creazione del link IPFS
        let ipfsGateway = "https://ipfs.io/ipfs/";
        let ipfsHttpURI = certificate.ipfsURI ? certificate.ipfsURI.replace("ipfs://", ipfsGateway) : "N/A";

        // Mostra i dettagli del certificato verificato
        // Aggiorna il contenuto dei dettagli
        document.getElementById(`details-${tokenId}`).innerHTML = `
            <strong>IPFS URI:</strong> <a href="${ipfsHttpURI}" target="_blank">${ipfsHttpURI}</a><br>
            <strong>Revocato:</strong> ${certificate.revoked ? 'Sì' : 'No'} <br>
            <strong>Motivo Revoca:</strong> ${certificate.revokeReason || 'N/A'} <br>
            <strong>Issuer:</strong> ${certificate.issuer}
        `;
        document.getElementById(`details-${tokenId}`).style.display = "block";
    } catch (error) {
        alert(`Errore durante la verifica: ${error.message}`);
    }
}
