/* 
   Assicurati di avere il client ipfs-http-client disponibile.
   Puoi includere la libreria IPFS nel tuo HTML (admin.html) con:
   <script src="https://unpkg.com/ipfs-http-client/dist/index.min.js"></script>

   Oppure installarla localmente:
   npm install ipfs-http-client
   (e poi usare un bundler o import specifico)

   In questa versione assumiamo che window.IpfsHttpClient sia accessibile.
*/

function displayResult(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.innerHTML = message; // useremo innerHTML perché mostriamo potenzialmente tag <br>
    element.style.color = isError ? "red" : "green";
}

// Variabile globale per il client IPFS
let ipfsClient = null;

/**
 * Inizializza IPFS (se hai un daemon in locale su 127.0.0.1:5001)
 * Oppure se usi un gateway tipo Infura, modifica l'URL di conseguenza.
 */
async function initIPFS() {
    try {
        // Se usi un nodo IPFS locale:
        const { create } = window.IpfsHttpClient;
        ipfsClient = create({ url: 'http://127.0.0.1:5001/api/v0' });
        console.log("IPFS client pronto.");
    } catch (error) {
        console.error("Errore inizializzazione IPFS:", error);
    }
}

// Quando la pagina viene caricata
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza IPFS
    initIPFS();

    // Eventuali altre logiche di caricamento
});

/**
 * Esegue la connessione del wallet (Metamask) e mostra l'indirizzo utente
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
 * Legge il file PDF (se presente), lo carica su IPFS e poi emette il certificato.
 */
async function handleIssueCertificate() {
    // Leggiamo i campi
    const pdfFile = document.getElementById('pdfFile')?.files[0];
    const beneficiary = document.getElementById('beneficiary').value;
    const institutionName = document.getElementById('institutionName').value;
    const certificateTitle = document.getElementById('certificateTitle').value;
    const beneficiaryName = document.getElementById('beneficiaryName').value;
    const dateIssued = document.getElementById('dateIssued').value;

    // Se l'utente avesse un campo ipfsURI manuale, puoi recuperarlo:
    // const manualIpfsURI = document.getElementById('ipfsURI')?.value || "";

    let finalIpfsURI = ""; // Sarà l'URI da passare a issueCertificate

    try {
        // Se l'utente ha selezionato un PDF, lo carichiamo su IPFS
        if (pdfFile && ipfsClient) {
            displayResult('issueResult', "Caricamento del PDF su IPFS in corso...");

            // Aggiungiamo il file a IPFS
            const addedFile = await ipfsClient.add(pdfFile);
            const cid = addedFile.cid.toString();

            // Creiamo l'URI finale in formato ipfs://
            finalIpfsURI = "ipfs://" + cid;
            console.log("PDF caricato su IPFS, CID:", cid);
        } else {
            // Se non c'è PDF, gestisci come preferisci:
            // - Puoi usare un valore manuale (se c'è un input "ipfsURI")
            // - Oppure dare errore
            // Per semplicità, mettiamo un messaggio di errore:
            throw new Error("Nessun PDF selezionato oppure client IPFS non disponibile.");

            // Se preferisci fallback su un eventuale manualIpfsURI:
            // finalIpfsURI = manualIpfsURI || "";
        }

        // Ora emettiamo il certificato
        displayResult('issueResult', "Emissione del certificato su blockchain...");
        const txHash = await issueCertificate(
            beneficiary,
            institutionName,
            certificateTitle,
            beneficiaryName,
            dateIssued,
            finalIpfsURI
        );

        displayResult('issueResult', `Certificato emesso con successo! TX Hash: ${txHash}`);
    } catch (error) {
        displayResult('issueResult', error.message, true);
    }
}

/**
 * Verifica un certificato e ne mostra i dettagli
 */
async function handleCheckCertificate() {
    const tokenId = document.getElementById('certificateId').value;

    try {
        const certificate = await checkCertificate(tokenId);

        // Convertire l'IPFS URI in un link accessibile dal browser
        let ipfsGateway = "https://ipfs.io/ipfs/";
        let ipfsHttpURI = certificate.ipfsURI.replace("ipfs://", ipfsGateway);

        const details = `
            <strong>Istituzione:</strong> ${certificate.institutionName}<br>
            <strong>Titolo:</strong> ${certificate.certificateTitle}<br>
            <strong>Beneficiario:</strong> ${certificate.beneficiaryName}<br>
            <strong>Emesso il:</strong> ${certificate.dateIssued}<br>
            <strong>IPFS:</strong> 
            <a href="${ipfsHttpURI}" target="_blank">${ipfsHttpURI}</a><br>
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

    try {
        const txHash = await revokeCertificate(tokenId, reason);
        displayResult('revokeResult', `Certificato revocato. TX Hash: ${txHash}`);
    } catch (error) {
        displayResult('revokeResult', error.message, true);
    }
}

/**
 * Recupera tutti i certificati dell'utente e li mostra
 */
async function handleGetNFTs() {
    try {
        const nftDetails = await getUserNFTs();

        if (Array.isArray(nftDetails) && nftDetails.length > 0) {
            let output = '<ul>';
            nftDetails.forEach((nft) => {
                // Conversione dell'URL IPFS nel gateway HTTP
                let ipfsGateway = "https://ipfs.io/ipfs/";
                let ipfsHttpURI = nft.ipfsURI.replace("ipfs://", ipfsGateway);

                output += `
                <li>
                    <strong>Token ID:</strong> ${nft.tokenId} <br>
                    <strong>Nome Istituzione:</strong> ${nft.institutionName} <br>
                    <strong>Nome Certificato:</strong> ${nft.certificateTitle} <br>
                    <strong>Beneficiario:</strong> ${nft.beneficiaryName} <br>
                    <strong>Data di Emissione:</strong> ${nft.dateIssued} <br>
                    <strong>IPFS URI:</strong> 
                    <a href="${ipfsHttpURI}" target="_blank">${ipfsHttpURI}</a> <br>
                    <strong>Revocato:</strong> ${nft.revoked ? 'Sì' : 'No'} <br>
                    <strong>Motivo Revoca:</strong> ${nft.revokeReason || 'N/A'} <br>
                    <strong>Issuer:</strong> ${nft.issuer}
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