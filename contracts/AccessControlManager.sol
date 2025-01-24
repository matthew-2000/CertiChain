// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AccessControlManager is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Assegna admin di default
    }

    function addIssuer(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ISSUER_ROLE, account);
    }

    function removeIssuer(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ISSUER_ROLE, account);
    }

    function hasIssuerRole(address account) public view returns (bool) {
        return hasRole(ISSUER_ROLE, account);
    }
}