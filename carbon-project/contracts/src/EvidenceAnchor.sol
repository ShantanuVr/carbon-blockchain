// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title EvidenceAnchor
 * @dev Simple contract for anchoring evidence hashes on-chain
 * Stores content hashes (sha256) with optional URIs
 */
contract EvidenceAnchor is Ownable {
    struct Anchor {
        bytes32 hash;
        string uri;
        uint256 timestamp;
    }

    // Mapping from hash to anchor data
    mapping(bytes32 => Anchor) public anchors;
    
    // Array of all hashes (for enumeration)
    bytes32[] public allHashes;

    event Anchored(bytes32 indexed hash, string uri, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Anchor an evidence hash
     * @param hash The sha256 hash (bytes32)
     * @param uri Optional URI (IPFS, HTTP, or local path)
     */
    function anchor(bytes32 hash, string memory uri) external {
        require(anchors[hash].timestamp == 0, "Hash already anchored");

        anchors[hash] = Anchor({
            hash: hash,
            uri: uri,
            timestamp: block.timestamp
        });

        allHashes.push(hash);

        emit Anchored(hash, uri, block.timestamp);
    }

    /**
     * @dev Check if a hash is anchored
     */
    function isAnchored(bytes32 hash) external view returns (bool) {
        return anchors[hash].timestamp > 0;
    }

    /**
     * @dev Get anchor data
     */
    function getAnchor(bytes32 hash) external view returns (Anchor memory) {
        return anchors[hash];
    }

    /**
     * @dev Get total number of anchored hashes
     */
    function totalAnchors() external view returns (uint256) {
        return allHashes.length;
    }
}

