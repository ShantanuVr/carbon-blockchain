# blockchain.py

import json
from hashlib import sha256
from time import time


class Blockchain(object):
    def __init__(self):
        self.chain = []
        self.current_transactions = []
        self.new_block(previous_hash=1, proof=100)

    def proof_of_work(self, last_proof):
        # This method implements the consensus algorithm (Proof of Work)
        # It takes two parameters including self and last_proof
        proof = 0
        while self.valid_proof(last_proof, proof) is False:
            proof += 1
        return proof

    @staticmethod
    def valid_proof(last_proof, proof):
        # This method validates the block
        guess = f'{last_proof}{proof}'.encode()
        guess_hash = sha256(guess).hexdigest()
        return guess_hash[:4] == "0000"

    def new_block(self, proof, previous_hash=None):
        # This function creates new blocks and then adds to the existing chain
        # This method will contain two parameters proof, previous hash
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'proof': proof,
            'previous_hash': previous_hash or self.hash(self.chain[-1]),
            'transactions': self.current_transactions.copy()
        }
        # Set the current transaction list to empty.
        self.current_transactions = []
        self.chain.append(block)
        return block

    def new_transaction(self, sender, recipient, credits, project_type=None, description=None):
        # This function adds a new carbon credit transaction
        # Credits: amount of carbon credits (typically in tonnes of CO2 equivalent)
        # project_type: type of carbon offset project (e.g., "renewable_energy", "reforestation", "carbon_capture")
        # description: optional description of the transaction
        transaction = {
            'sender': sender,
            'recipient': recipient,
            'credits': credits,  # Carbon credits in tonnes CO2e
            'project_type': project_type,
            'description': description,
            'timestamp': time()
        }
        self.current_transactions.append(transaction)
        return self.last_block['index'] + 1

    def issue_credits(self, recipient, credits, project_type, description=None):
        # Issue new carbon credits (similar to mining - creates new credits)
        # This is used when a carbon offset project generates new credits
        return self.new_transaction(
            sender="0",  # 0 indicates newly issued credits
            recipient=recipient,
            credits=credits,
            project_type=project_type,
            description=description or f"Issued {credits} carbon credits from {project_type} project"
        )

    def retire_credits(self, owner, credits, reason=None):
        # Retire (burn) carbon credits permanently
        # This transfers credits to a burn address, effectively removing them from circulation
        # Credits are permanently removed and cannot be reused
        burn_address = "BURN"
        description = f"RETIRED: {credits} carbon credits burned" + (f" - {reason}" if reason else "")
        return self.new_transaction(
            sender=owner,
            recipient=burn_address,
            credits=credits,
            project_type="retirement",
            description=description
        )

    @staticmethod
    def hash(block):
        # Used for hashing a block
        # The follow code will create a SHA - 256 block hash
        # and also ensure that the dictionary is ordered

        # convert this to a dictionary of strings
        new_block = dict()
        for key in block.keys():
            new_block[key] = str(block[key])

        block_string = json.dumps(new_block).encode()
        return sha256(block_string).hexdigest()

    @property
    def last_block(self):
        # Calls and returns the last block of the chain
        return self.chain[-1]