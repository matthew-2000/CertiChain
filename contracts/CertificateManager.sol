// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateManager is ERC721Enumerable, Ownable {

    // Informazioni aggiuntive
    struct CertificateInfo {
        string institutionName;   // ente emittente
        string certificateTitle;  // titolo
        string beneficiaryName;   // nome beneficiario
        string dateIssued;        // data
        string ipfsURI;           // link ai metadati su IPFS (es. ipfs://CID)
        bool revoked;
        string revokeReason;
        address issuer;
    }

    mapping(uint256 => CertificateInfo) public certificates;
    uint256 public currentTokenId;

    // Issuer autorizzati
    mapping(address => bool) public authorizedIssuers;

    // Eventi
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed issuer,
        address indexed beneficiary
    );
    event CertificateRevoked(
        uint256 indexed tokenId,
        address indexed issuer,
        string reason
    );

    constructor(address initialOwner) ERC721("BlockchainCertificate", "BCERT") Ownable(initialOwner) {
        // Aggiungiamo di default il deployer come issuer autorizzato
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }

    // Aggiunge un nuovo issuer (solo l'owner)
    function addIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = true;
    }

    // Rimuove un issuer (solo l'owner)
    function removeIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = false;
    }

    /**
     * @dev Emissione del certificato
     */
    function issueCertificate(
        address beneficiary,
        string memory institutionName,
        string memory certificateTitle,
        string memory beneficiaryName,
        string memory dateIssued,
        string memory ipfsURI
    )
    external
    onlyAuthorizedIssuer
    {
        currentTokenId++;
        uint256 newTokenId = currentTokenId;

        _safeMint(beneficiary, newTokenId);

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

    /**
     * @dev Revoca del certificato
     */
    function revokeCertificate(uint256 tokenId, string memory reason)
    external
    onlyAuthorizedIssuer
    {
        require(ownerOf(tokenId) != address(0), "Certificate does not exist");
        require(!certificates[tokenId].revoked, "Already revoked");

        certificates[tokenId].revoked = true;
        certificates[tokenId].revokeReason = reason;

        emit CertificateRevoked(tokenId, msg.sender, reason);
    }

    /**
     * @dev Verifica semplice: restituisce info sul certificato
     */
    function verifyCertificate(uint256 tokenId)
    external
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
        if (!(ownerOf(tokenId) != address(0))) {
            // Se il token non esiste, return false
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
