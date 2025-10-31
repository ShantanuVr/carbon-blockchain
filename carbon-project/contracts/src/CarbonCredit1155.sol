// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CarbonCredit1155
 * @dev ERC-1155 token contract for representing carbon credits on-chain
 * Each tokenId maps to a credit class (off-chain registry)
 * Supports minting (issuance) and burning (retirement)
 */
contract CarbonCredit1155 is ERC1155, Ownable {
    using Strings for uint256;

    // Mapping from tokenId to classId (string identifier from registry)
    mapping(uint256 => string) public classIdByTokenId;
    mapping(string => uint256) public tokenIdByClassId;

    // Events
    event ClassMapped(uint256 indexed tokenId, string classId);
    event Minted(address indexed to, uint256 indexed tokenId, uint256 amount, string classId);
    event Burned(address indexed from, uint256 indexed tokenId, uint256 amount, string classId);

    constructor(string memory uri_) ERC1155(uri_) Ownable(msg.sender) {}

    /**
     * @dev Map a classId to a tokenId and mint initial supply
     * @param to Address to mint tokens to
     * @param tokenId The token ID to use
     * @param classId The off-chain class identifier
     * @param amount Initial supply to mint
     */
    function mintClass(
        address to,
        uint256 tokenId,
        string memory classId,
        uint256 amount
    ) external onlyOwner {
        require(bytes(classIdByTokenId[tokenId]).length == 0, "TokenId already mapped");
        require(tokenIdByClassId[classId] == 0, "ClassId already mapped");

        classIdByTokenId[tokenId] = classId;
        tokenIdByClassId[classId] = tokenId;

        _mint(to, tokenId, amount, "");

        emit ClassMapped(tokenId, classId);
        emit Minted(to, tokenId, amount, classId);
    }

    /**
     * @dev Mint additional tokens for an existing class
     */
    function mint(address to, uint256 tokenId, uint256 amount) external onlyOwner {
        require(bytes(classIdByTokenId[tokenId]).length > 0, "TokenId not mapped");
        _mint(to, tokenId, amount, "");
        
        string memory classId = classIdByTokenId[tokenId];
        emit Minted(to, tokenId, amount, classId);
    }

    /**
     * @dev Burn tokens (retirement)
     */
    function burn(address from, uint256 tokenId, uint256 amount) external {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "ERC1155: caller is not owner nor approved"
        );
        _burn(from, tokenId, amount);
        
        string memory classId = classIdByTokenId[tokenId];
        emit Burned(from, tokenId, amount, classId);
    }

    /**
     * @dev Get classId for a tokenId
     */
    function getClassId(uint256 tokenId) external view returns (string memory) {
        return classIdByTokenId[tokenId];
    }

    /**
     * @dev Get tokenId for a classId
     */
    function getTokenId(string memory classId) external view returns (uint256) {
        return tokenIdByClassId[classId];
    }
}

