.PHONY: install build deploy addresses

install:
	forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit

build:
	forge build

deploy:
	forge script script/Deploy.s.sol:DeployScript --rpc-url $(RPC_URL) --broadcast --verify -vvvv

addresses:
	cat addresses.json

