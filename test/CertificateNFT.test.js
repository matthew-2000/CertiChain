const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateNFT", function () {
    let CertificateNFT;
    let certificateNFT;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        CertificateNFT = await ethers.getContractFactory("CertificateNFT");
        // Il costruttore di CertificateNFT richiede un 'initialOwner'
        certificateNFT = await CertificateNFT.deploy(owner.address);
        await certificateNFT.waitForDeployment();
    });

    it("Dovrebbe avere il nome e il simbolo corretti", async function () {
        expect(await certificateNFT.name()).to.equal("BlockchainCertificate");
        expect(await certificateNFT.symbol()).to.equal("BCERT");
    });

    it("Dovrebbe permettere al proprietario di settare il baseURI", async function () {
        await certificateNFT.setBaseURI("https://mio-base-uri/");
        expect(await certificateNFT.baseURI()).to.equal("https://mio-base-uri/");
    });

    it("Dovrebbe mintare un certificato correttamente", async function () {
        await certificateNFT.mintCertificate(addr1.address, 1, "tokenURI1");
        expect(await certificateNFT.ownerOf(1)).to.equal(addr1.address);
        expect(await certificateNFT.tokenURI(1)).to.equal("tokenURI1");
    });

    it("Dovrebbe impedire a un non-proprietario di mintare un certificato", async function () {
        await expect(
            certificateNFT.connect(addr1).mintCertificate(addr1.address, 2, "tokenURI2")
        ).to.be.reverted;
    });

    it("Dovrebbe burnare un certificato esistente", async function () {
        await certificateNFT.mintCertificate(addr1.address, 3, "tokenURI3");
        expect(await certificateNFT.ownerOf(3)).to.equal(addr1.address);

        await certificateNFT.burnCertificate(3);
        await expect(certificateNFT.ownerOf(3)).to.be.reverted;
    });

    it("Dovrebbe impedire di burnare un certificato non esistente", async function () {
        await expect(
            certificateNFT.burnCertificate(999)
        ).to.be.reverted;
    });
});
