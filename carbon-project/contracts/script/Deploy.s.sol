// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {CarbonCredit1155} from "../src/CarbonCredit1155.sol";
import {EvidenceAnchor} from "../src/EvidenceAnchor.sol";
import {stdJson} from "forge-std/StdJson.sol";

contract DeployScript is Script {
    using stdJson for string;

    function run() external returns (address creditToken, address evidenceAnchor) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        string memory baseURI = "https://carbon-classroom.local/metadata/";
        
        CarbonCredit1155 credit = new CarbonCredit1155(baseURI);
        EvidenceAnchor anchor = new EvidenceAnchor();

        vm.stopBroadcast();

        // Write addresses to file
        string memory json = "";
        json.serialize("chainId", block.chainid);
        json.serialize("rpcUrl", vm.envString("RPC_URL"));
        json.serialize("CarbonCredit1155", address(credit));
        json.serialize("EvidenceAnchor", address(anchor));
        json.serialize("deployer", vm.addr(deployerPrivateKey));

        vm.writeFile("addresses.json", json);

        return (address(credit), address(anchor));
    }
}

