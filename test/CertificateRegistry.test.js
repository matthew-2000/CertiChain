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

        // Aggiungo issuer (ruolo emittente)
        await accessControlManager.addIssuer(issuer.address);

        // 2. Deploy CertificateNFT, passando "owner" come proprietario iniziale
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

        // 4. Trasferisco la ownership di CertificateNFT alla Registry
        //    in modo che "mintCertificate" possa essere chiamato correttamente via "onlyOwner"
        await certificateNFT
            .connect(owner)
            .transferOwnership(await certificateRegistry.getAddress());
    });

    it("Dovrebbe permettere ad un issuer autorizzato di emettere un certificato", async function () {
        // Prepariamo un "hashedSecret"
        const secret = "secret";
        const hashedSecret = ethers.keccak256(ethers.toUtf8Bytes(secret));

        // Emissione del certificato
        await certificateRegistry.connect(issuer).issueCertificate(
            addr2.address,
            hashedSecret,
            "ipfs://someURI"
        );

        // Controllo che l'NFT sia stato mintato correttamente
        expect(await certificateNFT.ownerOf(1)).to.equal(addr2.address);

        // Controllo nella mapping "certificates"
        const certInfo = await certificateRegistry.certificates(1);
        expect(certInfo.hashedSecret).to.equal(hashedSecret);
        expect(certInfo.ipfsURI).to.equal("ipfs://someURI");
        expect(certInfo.revoked).to.equal(false);
        expect(certInfo.revokeReason).to.equal("");
        expect(certInfo.issuer).to.equal(issuer.address);
    });

    it("Non dovrebbe permettere ad un non-issuer di emettere un certificato", async function () {
        const hashedSecret = ethers.keccak256(ethers.toUtf8Bytes("someSecret"));

        // addr2 non ha ruolo "issuer"
        await expect(
            certificateRegistry.connect(addr2).issueCertificate(
                addr3.address,
                hashedSecret,
                "ipfs://anotherURI"
            )
        ).to.be.revertedWith("Not an authorized issuer");
    });

    it("Dovrebbe revocare correttamente un certificato se chiamato da un issuer autorizzato", async function () {
        const hashedSecret = ethers.keccak256(ethers.toUtf8Bytes("mySecret"));

        // Emettiamo prima un certificato
        await certificateRegistry.connect(issuer).issueCertificate(
            addr2.address,
            hashedSecret,
            "ipfs://someURI"
        );

        // Revoca
        await certificateRegistry.connect(issuer).revokeCertificate(1, "Revoked for reasons");

        const certInfo = await certificateRegistry.certificates(1);
        expect(certInfo.revoked).to.equal(true);
        expect(certInfo.revokeReason).to.equal("Revoked for reasons");
    });

    it("Non dovrebbe revocare un certificato se chiamato da un non-issuer", async function () {
        const hashedSecret = ethers.keccak256(ethers.toUtf8Bytes("mySecret"));

        // Emissione
        await certificateRegistry.connect(issuer).issueCertificate(
            addr2.address,
            hashedSecret,
            "ipfs://someURI"
        );

        // addr2 non ha ruolo "issuer"
        await expect(
            certificateRegistry.connect(addr2).revokeCertificate(1, "Invalid attempt")
        ).to.be.revertedWith("Not an authorized issuer");
    });

    it("La funzione verifyCertificate deve restituire correttamente i dati di un certificato", async function () {
        const hashedSecret = ethers.keccak256(ethers.toUtf8Bytes("verifica"));

        // Emettiamo certificato
        await certificateRegistry.connect(issuer).issueCertificate(
            addr2.address,
            hashedSecret,
            "ipfs://someURI"
        );

        // Verifica (tokenId = 1, providedHash = hashedSecret)
        const [valid, revoked, ipfsURI] = await certificateRegistry.verifyCertificate(1, hashedSecret);

        expect(valid).to.equal(true);      // Se l'hash coincide, valid = true
        expect(revoked).to.equal(false);   // Non è stato revocato
        expect(ipfsURI).to.equal("ipfs://someURI");
    });

    it("La funzione verifyCertificate deve restituire valid=false se il certificato NON esiste o l'hash non coincide", async function () {
        // 1) Certificato inesistente -> tokenId 999
        let [valid, revoked, ipfsURI] = await certificateRegistry.verifyCertificate(999, ethers.ZeroHash);
        expect(valid).to.equal(false);
        expect(revoked).to.equal(false);
        expect(ipfsURI).to.equal("");

        // 2) Emesso un certificato con un certo hash
        const realHash = ethers.keccak256(ethers.toUtf8Bytes("realHash"));
        await certificateRegistry.connect(issuer).issueCertificate(
            addr2.address,
            realHash,
            "ipfs://realURI"
        );

        // Ma ora verifichiamo con un hash sbagliato
        const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong"));
        [valid, revoked, ipfsURI] = await certificateRegistry.verifyCertificate(1, wrongHash);

        expect(valid).to.equal(false);
        expect(revoked).to.equal(false);
        expect(ipfsURI).to.equal("");
    });
});
