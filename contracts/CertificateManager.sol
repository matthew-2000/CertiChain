// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importiamo il contratto ERC721 di OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateManager is ERC721, Ownable {

    // Struttura per memorizzare i dati del certificato
    struct CertificateInfo {
        string ipfsURI;    // link ai metadati su IPFS (es. ipfs://CID)
        bool revoked;      // flag di revoca
        string revokeReason;
        address issuer;    // chi ha emesso il certificato
    }

    // Mappa: tokenId => CertificateInfo
    mapping(uint256 => CertificateInfo) public certificates;

    // Contatore per generare nuovi tokenId
    uint256 public currentTokenId;

    // Mapping per tenere traccia degli issuer autorizzati
    mapping(address => bool) public authorizedIssuers;

    // Eventi
    event CertificateIssued(uint256 indexed tokenId, address indexed issuer, address indexed beneficiary);
    event CertificateRevoked(uint256 indexed tokenId, address indexed issuer, string reason);

    constructor(address initialOwner) ERC721("BlockchainCertificate", "BCERT") Ownable(initialOwner) {
        // Aggiungiamo di default il deployer come issuer autorizzato
        authorizedIssuers[msg.sender] = true;
    }

    // Modificatore che permette l'accesso solo agli issuer autorizzati
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }

    // Aggiunta di un nuovo issuer
    function addIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = true;
    }

    // Rimozione di un issuer
    function removeIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = false;
    }

    /**
     * @dev Emissione del certificato (FR1).
     * @param beneficiary Indirizzo del beneficiario (studente/professionista).
     * @param _ipfsURI URI su IPFS con i metadati del certificato.
     */
    function issueCertificate(address beneficiary, string memory _ipfsURI)
    external
    onlyAuthorizedIssuer
    {
        currentTokenId++;
        uint256 newTokenId = currentTokenId;

        // Mint dell'NFT al beneficiario
        _safeMint(beneficiary, newTokenId);

        // Salviamo i metadati nel mapping
        certificates[newTokenId] = CertificateInfo({
            ipfsURI: _ipfsURI,
            revoked: false,
            revokeReason: "",
            issuer: msg.sender
        });

        // Emettiamo l'evento
        emit CertificateIssued(newTokenId, msg.sender, beneficiary);
    }

    // (Per completezza) Una funzione di revoca minimale - non strettamente necessaria per FR1
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
}