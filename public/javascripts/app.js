document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;

    if (currentPage.includes('user.html')) {
        document.getElementById('getNFTsBtn').addEventListener('click', handleGetNFTs);
    }

    if (currentPage.includes('admin.html')) {
        document.getElementById('issueCertificateBtn').addEventListener('click', handleIssueCertificate);
        document.getElementById('revokeCertificateBtn').addEventListener('click', handleRevokeCertificate);
    }

    if (currentPage.includes('verifier.html')) {
        document.getElementById('checkCertificateBtn').addEventListener('click', handleCheckCertificate);
    }

    if (document.getElementById('connectBtn')) {
        document.getElementById('connectBtn').addEventListener('click', handleConnect);
    }
});
