function displayResult(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.innerHTML = message;
    element.style.color = isError ? "red" : "green";
}

let ipfsClient = null;

/**
 * Inizializza IPFS
 */
async function initIPFS() {
    try {
        const { create } = window.IpfsHttpClient;
        ipfsClient = create({ url: 'http://127.0.0.1:5001/api/v0' });
        console.log("IPFS client pronto.");
    } catch (error) {
        console.error("Errore inizializzazione IPFS:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initIPFS().then(r => {});
});

/**
 * Connetti il wallet dell'utente
 */
async function handleConnect() {
    try {
        const address = await connectWallet();
        document.getElementById('userAddress').innerText = `Connesso: ${address}`;
    } catch (error) {
        displayResult('userAddress', error.message, true);
    }
}

/**
 * Emette un certificato
 */
async function handleIssueCertificate() {
    const pdfFile = document.getElementById('pdfFile')?.files[0];
    const beneficiary = document.getElementById('beneficiary').value;
    const secret = document.getElementById('certificateSecret').value;

    if (!beneficiary || !secret) {
        displayResult('issueResult', "Beneficiario e segreto sono obbligatori!", true);
        return;
    }

    let finalIpfsURI = "";

    try {
        if (pdfFile && ipfsClient) {
            displayResult('issueResult', "Caricamento del PDF su IPFS in corso...");

            const addedFile = await ipfsClient.add(pdfFile);
            const cid = addedFile.cid.toString();
            finalIpfsURI = "ipfs://" + cid;
            console.log("PDF caricato su IPFS, CID:", cid);
        } else {
            throw new Error("Nessun PDF selezionato o IPFS non disponibile.");
        }

        displayResult('issueResult', "Emissione del certificato su blockchain...");

        const txHash = await issueCertificate(
            beneficiary,
            secret,
            finalIpfsURI
        );

        displayResult('issueResult', `Certificato emesso con successo! TX Hash: ${txHash}`);
    } catch (error) {
        displayResult('issueResult', error.message, true);
    }
}

/**
 * Verifica un certificato
 */
async function handleCheckCertificate() {
    const tokenId = document.getElementById('certificateId').value;
    const secret = document.getElementById('providedSecret').value;

    if (!tokenId || !secret) {
        displayResult('certificateDetails', "ID e segreto sono obbligatori!", true);
        return;
    }

    try {
        const certificate = await checkCertificate(tokenId, secret);
        let ipfsGateway = "https://ipfs.io/ipfs/";
        let ipfsHttpURI = certificate.ipfsURI.replace("ipfs://", ipfsGateway);

        const details = `
            <strong>IPFS:</strong> <a href="${ipfsHttpURI}" target="_blank">${ipfsHttpURI}</a><br>
            <strong>Revocato:</strong> ${certificate.revoked ? 'Sì' : 'No'}<br>
            <strong>Motivo revoca:</strong> ${certificate.revokeReason || 'N/A'}<br>
            <strong>Issuer:</strong> ${certificate.issuer}<br>
            <strong>Valido:</strong> ${certificate.valid ? 'Sì' : 'No'}<br>
        `;
        displayResult('certificateDetails', details);
    } catch (error) {
        displayResult('certificateDetails', error.message, true);
    }
}

/**
 * Revoca un certificato
 */
async function handleRevokeCertificate() {
    const tokenId = document.getElementById('revokeId').value;
    const reason = document.getElementById('revokeReason').value;

    if (!tokenId || !reason) {
        displayResult('revokeResult', "ID e motivo sono obbligatori!", true);
        return;
    }

    try {
        const txHash = await revokeCertificate(tokenId, reason);
        displayResult('revokeResult', `Certificato revocato. TX Hash: ${txHash}`);
    } catch (error) {
        displayResult('revokeResult', error.message, true);
    }
}

/**
 * Mostra la lista dei certificati dell'utente senza dettagli
 */
async function handleGetNFTs() {
    try {
        const nftDetails = await getUserNFTs();

        if (Array.isArray(nftDetails) && nftDetails.length > 0) {
            let output = '<ul>';
            nftDetails.forEach((nft) => {
                output += `
                <li id="cert-${nft.tokenId}">
                    <strong>Token ID:</strong> ${nft.tokenId} <br>
                    <button onclick="verifyCertificateDetails(${nft.tokenId})" class="btn btn-primary mt-2">Verifica</button>
                    <div id="details-${nft.tokenId}" class="mt-2" style="display: none;"></div>
                </li><br>`;
            });

            output += '</ul>';
            displayResult('myNft', output);
        } else {
            displayResult('myNft', "Nessun certificato trovato.");
        }
    } catch (error) {
        displayResult('myNft', error.message, true);
    }
}

