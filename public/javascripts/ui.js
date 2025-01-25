function displayResult(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.innerHTML = message; // useremo innerHTML perché mostriamo potenzialmente tag <br>
    element.style.color = isError ? "red" : "green";
}

async function handleConnect() {
    try {
        const address = await connectWallet();
        document.getElementById('userAddress').innerText = `Connesso: ${address}`;
    } catch (error) {
        displayResult('userAddress', error.message, true);
    }
}

async function handleIssueCertificate() {
    const beneficiary = document.getElementById('beneficiary').value;
    const institutionName = document.getElementById('institutionName').value;
    const certificateTitle = document.getElementById('certificateTitle').value;
    const beneficiaryName = document.getElementById('beneficiaryName').value;
    const dateIssued = document.getElementById('dateIssued').value;
    const ipfsURI = document.getElementById('ipfsURI').value;

    try {
        const txHash = await issueCertificate(
            beneficiary,
            institutionName,
            certificateTitle,
            beneficiaryName,
            dateIssued,
            ipfsURI
        );
        displayResult('issueResult', `Certificato emesso in TX: ${txHash}`);
    } catch (error) {
        displayResult('issueResult', error.message, true);
    }
}

async function handleCheckCertificate() {
    const tokenId = document.getElementById('certificateId').value;

    try {
        // Otteniamo TUTTE le info, compreso revokeReason
        const certificate = await checkCertificate(tokenId);

        const details = `
            <strong>Istituzione:</strong> ${certificate.institutionName}<br>
            <strong>Titolo:</strong> ${certificate.certificateTitle}<br>
            <strong>Beneficiario:</strong> ${certificate.beneficiaryName}<br>
            <strong>Emesso il:</strong> ${certificate.dateIssued}<br>
            <strong>IPFS:</strong> <a href="${certificate.ipfsURI}" target="_blank">${certificate.ipfsURI}</a><br>
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

async function handleGetNFTs() {
    try {
        const nftDetails = await getUserNFTs();

        if (Array.isArray(nftDetails) && nftDetails.length > 0) {
            let output = '<ul>';
            nftDetails.forEach((nft) => {
                output += `
                <li>
                    <strong>Token ID:</strong> ${nft.tokenId} <br>
                    <strong>Nome Istituzione:</strong> ${nft.institutionName} <br>
                    <strong>Nome Certificato:</strong> ${nft.certificateTitle} <br>
                    <strong>Beneficiario:</strong> ${nft.beneficiaryName} <br>
                    <strong>Data di Emissione:</strong> ${nft.dateIssued} <br>
                    <strong>IPFS URI:</strong> <a href="${nft.ipfsURI}" target="_blank">${nft.ipfsURI}</a> <br>
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