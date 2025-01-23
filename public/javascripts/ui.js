function displayResult(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.innerText = message;
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
    const ipfsURI = document.getElementById('ipfsURI').value;

    try {
        const txHash = await issueCertificate(beneficiary, ipfsURI);
        displayResult('issueResult', `Certificato emesso in TX: ${txHash}`);
    } catch (error) {
        displayResult('issueResult', error.message, true);
    }
}

async function handleCheckCertificate() {
    const tokenId = document.getElementById('certificateId').value;

    try {
        const certificate = await checkCertificate(tokenId);
        displayResult('certificateDetails', `IPFS: ${certificate.ipfsURI}, Revoked: ${certificate.revoked}`);
    } catch (error) {
        displayResult('certificateDetails', error.message, true);
    }
}

async function handleRevokeCertificate() {
    const tokenId = document.getElementById('revokeId').value;
    const reason = document.getElementById('revokeReason').value;

    try {
        const txHash = await revokeCertificate(tokenId, reason);
        displayResult('revokeResult', `Certificato revocato: ${txHash}`);
    } catch (error) {
        displayResult('revokeResult', error.message, true);
    }
}

async function handleGetNFTs() {
    try {
        const nftDetails = await getUserNFTs();
        displayResult('myNft', nftDetails);
    } catch (error) {
        displayResult('myNft', error.message, true);
    }
}