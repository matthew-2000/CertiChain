const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControlManager", function () {
    let AccessControlManager;
    let accessControlManager;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        AccessControlManager = await ethers.getContractFactory("AccessControlManager");
        accessControlManager = await AccessControlManager.deploy();
        await accessControlManager.waitForDeployment();
    });

    it("Dovrebbe assegnare DEFAULT_ADMIN_ROLE al deployer", async function () {
        const DEFAULT_ADMIN_ROLE = await accessControlManager.DEFAULT_ADMIN_ROLE();
        const hasDefaultAdminRole = await accessControlManager.hasRole(
            DEFAULT_ADMIN_ROLE,
            owner.address
        );
        expect(hasDefaultAdminRole).to.equal(true);
    });

    it("Dovrebbe permettere all'admin di aggiungere un issuer", async function () {
        const ISSUER_ROLE = await accessControlManager.ISSUER_ROLE();

        await accessControlManager.addIssuer(addr1.address);
        const hasIssuerRole = await accessControlManager.hasRole(ISSUER_ROLE, addr1.address);
        expect(hasIssuerRole).to.equal(true);
    });

    it("Dovrebbe permettere all'admin di rimuovere un issuer", async function () {
        const ISSUER_ROLE = await accessControlManager.ISSUER_ROLE();

        await accessControlManager.addIssuer(addr1.address);
        let hasIssuerRole = await accessControlManager.hasRole(ISSUER_ROLE, addr1.address);
        expect(hasIssuerRole).to.equal(true);

        await accessControlManager.removeIssuer(addr1.address);
        hasIssuerRole = await accessControlManager.hasRole(ISSUER_ROLE, addr1.address);
        expect(hasIssuerRole).to.equal(false);
    });

    it("Non dovrebbe permettere a un non-admin di aggiungere un issuer", async function () {
        await expect(
            accessControlManager.connect(addr1).addIssuer(addr2.address)
        ).to.be.reverted; // più generico
    });

    it("La funzione hasIssuerRole deve restituire true/false correttamente", async function () {
        const ISSUER_ROLE = await accessControlManager.ISSUER_ROLE();

        // Prima non dovrebbe avere il ruolo
        let hasRole = await accessControlManager.hasIssuerRole(addr1.address);
        expect(hasRole).to.equal(false);

        // Aggiungo il ruolo e verifico di nuovo
        await accessControlManager.addIssuer(addr1.address);
        hasRole = await accessControlManager.hasIssuerRole(addr1.address);
        expect(hasRole).to.equal(true);
    });
});
