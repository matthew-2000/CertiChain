// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    string private message;

    event MessageUpdated(string newMessage);

    constructor(string memory _message) {
        message = _message;
    }

    function setMessage(string memory _newMessage) public {
        message = _newMessage;
        emit MessageUpdated(_newMessage);
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}
