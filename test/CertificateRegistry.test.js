const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
    let AccessControlManager, accessControlManager;
    let CertificateNFT, certificateNFT;
    let CertificateRegistry, certificateRegistry;
    let owner, issuer, addr2, addr3;

    beforeEach(async function () {
        [owner, issuer, addr2, addr3] = await ethers.getSigners();

        // 1. Deploy AccessControlManager
        AccessControlManager = await ethers.getContractFactory("AccessControlManager");
        accessControlManager = await AccessControlManager.deploy();
        await accessControlManager.waitForDeployment();

        // Aggiungo issuer
        await accessControlManager.addIssuer(issuer.address);

        // 2. Deploy CertificateNFT (passando "owner" come proprietario iniziale)
        CertificateNFT = await ethers.getContractFactory("CertificateNFT");
        certificateNFT = await CertificateNFT.deploy(owner.address);
        await certificateNFT.waitForDeployment();

        // 3. Deploy CertificateRegistry
        CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
        certificateRegistry = await CertificateRegistry.deploy(
            await accessControlManager.getAddress(),
            await certificateNFT.getAddress()
        );
        await certificateRegistry.waitForDeployment();

        // 4. Trasferisco la ownership di CertificateNFT
        //    dal "owner" (account che ha fatto il deploy) al contratto Registry
        //    in questo modo, le chiamate a 'mintCertificate' via la Registry
        //    passeranno la check "onlyOwner"
        await certificateNFT
            .connect(owner)
            .transferOwnership(await certificateRegistry.getAddress());
    });

    it("Dovrebbe permettere ad un issuer autorizzato di emettere un certificato", async function () {
        const tokenId = 1;

        // issuer è un account con ruolo "ISSUER" in AccessControlManager
        await certificateRegistry.connect(issuer).issueCertificate(
            addr2.address,
            "Università X",
            "Laurea in Informatica",
            "Mario Rossi",
            "2025-01-01",
            "ipfs://someURI"
        );

        // Verifico che l'owner del token NFT sia addr2
        expect(await certificateNFT.ownerOf(tokenId)).to.equal(addr2.address);

        // Verifico la struct
        const certInfo = await certificateRegistry.certificates(tokenId);
        expect(certInfo.institutionName).to.equal("Università X");
        expect(certInfo.certificateTitle).to.equal("Laurea in Informatica");
        expect(certInfo.beneficiaryName).to.equal("Mario Rossi");
        expect(certInfo.dateIssued).to.equal("2025-01-01");
        expect(certInfo.ipfsURI).to.equal("ipfs://someURI");
        expect(certInfo.revoked).to.equal(false);
        expect(certInfo.revokeReason).to.equal("");
        expect(certInfo.issuer).to.equal(issuer.address);
    });

    it("Non dovrebbe permettere ad un non-issuer di emettere un certificato", async function () {
        // addr2 non è un issuer autorizzato
        await expect(
            certificateRegistry.connect(addr2).issueCertificate(
                addr3.address,
                "Università Y",
                "Diploma in Matematica",
                "Giuseppe Verdi",
                "2025-05-10",
                "ipfs://someOtherURI"
            )
        ).to.be.revertedWith("Not an authorized issuer");
    });

    it("Dovrebbe revocare correttamente un certificato se chiamato da un issuer autorizzato", async function () {
        // Emettiamo prima un certificato
        await certificateRegistry.connect(issuer).issueCertificate(
            addr2.address,
            "Università X",
            "Laurea in Informatica",
            "Mario Rossi",
            "2025-01-01",
            "ipfs://someURI"
        );

        // Revoca
        await certificateRegistry.connect(issuer).revokeCertificate(1, "Revoked for reasons");
        const certInfo = await certificateRegistry.certificates(1);

        expect(certInfo.revoked).to.equal(true);
        expect(certInfo.revokeReason).to.equal("Revoked for reasons");
    });

    it("Non dovrebbe revocare un certificato se chiamato da un non-issuer", async function () {
        await certificateRegistry.connect(issuer).issueCertificate(
            addr2.address,
            "Università X",
            "Laurea in Informatica",
            "Mario Rossi",
            "2025-01-01",
            "ipfs://someURI"
        );

        // addr2 non è un issuer
        await expect(
            certificateRegistry.connect(addr2).revokeCertificate(1, "Invalid attempt")
        ).to.be.revertedWith("Not an authorized issuer");
    });

    it("La funzione verifyCertificate deve restituire correttamente i dati di un certificato", async function () {
        await certificateRegistry.connect(issuer).issueCertificate(
            addr2.address,
            "Università X",
            "Laurea in Informatica",
            "Mario Rossi",
            "2025-01-01",
            "ipfs://someURI"
        );

        const result = await certificateRegistry.verifyCertificate(1);
        // result è una tupla con: [ valid, revoked, issuer, institutionName, title, beneficiaryName, dateIssued, ipfs ]

        expect(result[0]).to.equal(true);  // valid = !revoked
        expect(result[1]).to.equal(false); // revoked
        expect(result[2]).to.equal(issuer.address);   // issuer
        expect(result[3]).to.equal("Università X");   // institutionName
        expect(result[4]).to.equal("Laurea in Informatica"); // title
        expect(result[5]).to.equal("Mario Rossi");           // beneficiaryName
        expect(result[6]).to.equal("2025-01-01");            // dateIssued
        expect(result[7]).to.equal("ipfs://someURI");        // ipfsURI
    });

    it("La funzione verifyCertificate deve restituire valid=false se il certificato non esiste", async function () {
        // Nessun certificato emesso con ID = 999
        const result = await certificateRegistry.verifyCertificate(999);

        expect(result[0]).to.equal(false);             // valid
        expect(result[1]).to.equal(false);             // revoked
        expect(result[2]).to.equal(ethers.ZeroAddress);// issuer
        expect(result[3]).to.equal("");                // institutionName
        expect(result[4]).to.equal("");                // title
        expect(result[5]).to.equal("");                // beneficiaryName
        expect(result[6]).to.equal("");                // dateIssued
        expect(result[7]).to.equal("");                // ipfs
    });
});
