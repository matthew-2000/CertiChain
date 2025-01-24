// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./AccessControlManager.sol";
import "./CertificateNFT.sol";

contract CertificateRegistry {
    struct CertificateInfo {
        string institutionName;
        string certificateTitle;
        string beneficiaryName;
        string dateIssued;
        string ipfsURI;
        bool revoked;
        string revokeReason;
        address issuer;
    }

    mapping(uint256 => CertificateInfo) public certificates;
    uint256 public currentTokenId;

    CertificateNFT public certificateNFT;
    AccessControlManager public accessControl;

    event CertificateIssued(uint256 indexed tokenId, address indexed issuer, address indexed beneficiary);
    event CertificateRevoked(uint256 indexed tokenId, address indexed issuer, string reason);

    constructor(address _accessControl, address _certificateNFT) {
        accessControl = AccessControlManager(_accessControl);
        certificateNFT = CertificateNFT(_certificateNFT);
    }

    modifier onlyAuthorizedIssuer() {
        require(accessControl.hasIssuerRole(msg.sender), "Not an authorized issuer");
        _;
    }

    function issueCertificate(
        address beneficiary,
        string memory institutionName,
        string memory certificateTitle,
        string memory beneficiaryName,
        string memory dateIssued,
        string memory ipfsURI
    ) public onlyAuthorizedIssuer {
        currentTokenId++;
        uint256 newTokenId = currentTokenId;

        // Mint the NFT using the CertificateNFT contract
        certificateNFT.mintCertificate(beneficiary, newTokenId, ipfsURI);

        certificates[newTokenId] = CertificateInfo({
            institutionName: institutionName,
            certificateTitle: certificateTitle,
            beneficiaryName: beneficiaryName,
            dateIssued: dateIssued,
            ipfsURI: ipfsURI,
            revoked: false,
            revokeReason: "",
            issuer: msg.sender
        });

        emit CertificateIssued(newTokenId, msg.sender, beneficiary);
    }

    function revokeCertificate(uint256 tokenId, string memory reason) public onlyAuthorizedIssuer {
        require(certificateNFT.ownerOf(tokenId) != address(0), "Certificate does not exist");
        require(!certificates[tokenId].revoked, "Already revoked");

        certificates[tokenId].revoked = true;
        certificates[tokenId].revokeReason = reason;

        emit CertificateRevoked(tokenId, msg.sender, reason);
    }

    function verifyCertificate(uint256 tokenId)
    public
    view
    returns (
        bool valid,
        bool revoked,
        address issuer,
        string memory institutionName,
        string memory title,
        string memory beneficiaryName,
        string memory dateIssued,
        string memory ipfs
    )
    {
        if (certificateNFT.ownerOf(tokenId) == address(0)) {
            return (false, false, address(0), "", "", "", "", "");
        }
        CertificateInfo memory info = certificates[tokenId];
        return (
            !info.revoked,
            info.revoked,
            info.issuer,
            info.institutionName,
            info.certificateTitle,
            info.beneficiaryName,
            info.dateIssued,
            info.ipfsURI
        );
    }
}
