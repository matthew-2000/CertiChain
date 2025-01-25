// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    function mintCertificate(address beneficiary, uint256 tokenId, string memory tokenURI) external onlyOwner {
        _mint(beneficiary, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function burnCertificate(uint256 tokenId) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        _burn(tokenId);
    }
}