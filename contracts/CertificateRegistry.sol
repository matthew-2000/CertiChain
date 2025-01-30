// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./AccessControlManager.sol";
import "./CertificateNFT.sol";

contract CertificateRegistry {
    struct CertificateInfo {
        bytes32 hashedSecret;
        string ipfsURI;
        bool revoked;
        string revokeReason;
        address issuer;
    }

    mapping(uint256 => CertificateInfo) public certificates;
    mapping(address => uint256[]) private userCertificates;
    uint256 public currentTokenId;

    CertificateNFT public certificateNFT;
    AccessControlManager public accessControl;

    event CertificateIssued(uint256 indexed tokenId, address indexed issuer, address indexed beneficiary, string ipfsURI);
    event CertificateRevoked(uint256 indexed tokenId, address indexed issuer, string reason);

    constructor(address _accessControl, address _certificateNFT) {
        accessControl = AccessControlManager(_accessControl);
        certificateNFT = CertificateNFT(_certificateNFT);
    }

    modifier onlyAuthorizedIssuer() {
        require(accessControl.hasIssuerRole(msg.sender), "Not an authorized issuer");
        _;
    }

    function issueCertificate(address beneficiary, bytes32 hashedSecret, string memory ipfsURI) public onlyAuthorizedIssuer {
        currentTokenId++;
        uint256 newTokenId = currentTokenId;

        // Mintiamo l'NFT PRIMA di salvare il certificato
        certificateNFT.mintCertificate(beneficiary, newTokenId, ipfsURI);

        certificates[newTokenId] = CertificateInfo({
            hashedSecret: hashedSecret,
            ipfsURI: ipfsURI,
            revoked: false,
            revokeReason: "",
            issuer: msg.sender
        });

        userCertificates[beneficiary].push(newTokenId);
        emit CertificateIssued(newTokenId, msg.sender, beneficiary, ipfsURI);
    }

    function revokeCertificate(uint256 tokenId, string memory reason) public onlyAuthorizedIssuer {
        require(!certificates[tokenId].revoked, "Already revoked");

        certificates[tokenId].revoked = true;
        certificates[tokenId].revokeReason = reason;

        emit CertificateRevoked(tokenId, msg.sender, reason);
    }

    function verifyCertificate(uint256 tokenId, bytes32 providedHash) public view returns (bool valid, bool revoked, string memory ipfsURI) {// Controllo se il certificato esiste
        if (certificates[tokenId].issuer == address(0)) {
            return (false, false, "");
        }

        CertificateInfo memory cert = certificates[tokenId];

        if (cert.hashedSecret == providedHash) {
            return (true, cert.revoked, cert.ipfsURI);
        }
        return (false, false, "");
    }
}
