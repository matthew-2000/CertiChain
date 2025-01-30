// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721URIStorage, Ownable {
    string public baseURI;

    constructor(address initialOwner) ERC721("BlockchainCertificate", "BCERT") Ownable(initialOwner) {
        // L'owner iniziale è "initialOwner"
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @dev Mint di un NFT con IPFS URI, affidandosi ai revert standard
     */
    function mintCertificate(address beneficiary, uint256 tokenId, string memory tokenURI)
    external
    onlyOwner
    {
        // Se il token esiste già, _mint() di OpenZeppelin revert con "ERC721: token already minted"
        _mint(beneficiary, tokenId);

        // Imposta la URI
        _setTokenURI(tokenId, tokenURI);
    }

    /**
     * @dev Brucia un certificato esistente, affidandosi ai revert standard
     */
    function burnCertificate(uint256 tokenId) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "ERC721: invalid token ID");
        _burn(tokenId);
    }
}