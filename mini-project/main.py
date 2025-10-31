# main.py - Carbon Credits Blockchain API

from uuid import uuid4
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from blockchain import Blockchain

app = Flask(__name__, template_folder='templates')
CORS(app)  # Enable CORS for all routes
node_identifier = str(uuid4()).replace('-', '')

# Initializing blockchain
blockchain = Blockchain()


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/api', methods=['GET'])
def api_info():
    return jsonify({
        'message': 'Carbon Credits Blockchain API',
        'endpoints': {
            '/validate': 'POST - Validate a block and add transactions to chain',
            '/issue': 'POST - Issue new carbon credits from a project',
            '/transfer': 'POST - Transfer carbon credits between parties',
            '/retire': 'POST - Retire (burn) carbon credits permanently',
            '/chain': 'GET - Get full blockchain',
            '/chain/length': 'GET - Get blockchain length',
            '/stats': 'GET - Get blockchain statistics'
        }
    }), 200


@app.route('/validate', methods=['POST'])
def validate_block():
    """
    Validate and add a new block to the chain.
    This endpoint performs proof of work and adds pending transactions to a new block.
    """
    last_block = blockchain.last_block
    last_proof = last_block['proof']
    proof = blockchain.proof_of_work(last_proof)

    # Create the new block and add it to the chain
    previous_hash = blockchain.hash(last_block)
    block = blockchain.new_block(proof, previous_hash)

    return jsonify({
        'message': 'New block validated and added to chain',
        'index': block['index'],
        'transactions': block['transactions'],
        'proof': block['proof'],
        'previous_hash': block['previous_hash'],
        'timestamp': block['timestamp']
    }), 200


@app.route('/issue', methods=['POST'])
def issue_credits():
    """
    Issue new carbon credits from a carbon offset project.
    Required: recipient, credits, project_type
    Optional: description
    """
    values = request.get_json()
    required = ['recipient', 'credits', 'project_type']
    
    if not all(k in values for k in required):
        return jsonify({
            'error': 'Missing required values',
            'required': required
        }), 400

    if values['credits'] <= 0:
        return jsonify({
            'error': 'Credits must be greater than 0'
        }), 400

    # Issue new carbon credits
    index = blockchain.issue_credits(
        recipient=values['recipient'],
        credits=values['credits'],
        project_type=values['project_type'],
        description=values.get('description')
    )
    
    return jsonify({
        'message': f'Carbon credits issued and scheduled for Block No. {index}',
        'recipient': values['recipient'],
        'credits': values['credits'],
        'project_type': values['project_type'],
        'block_index': index
    }), 201


@app.route('/transfer', methods=['POST'])
def transfer_credits():
    """
    Transfer carbon credits between parties.
    Required: sender, recipient, credits
    Optional: project_type, description
    """
    values = request.get_json()
    required = ['sender', 'recipient', 'credits']
    
    if not all(k in values for k in required):
        return jsonify({
            'error': 'Missing required values',
            'required': required
        }), 400

    if values['credits'] <= 0:
        return jsonify({
            'error': 'Credits must be greater than 0'
        }), 400

    # Create a new transaction
    index = blockchain.new_transaction(
        sender=values['sender'],
        recipient=values['recipient'],
        credits=values['credits'],
        project_type=values.get('project_type'),
        description=values.get('description')
    )
    
    return jsonify({
        'message': f'Carbon credit transfer scheduled for Block No. {index}',
        'sender': values['sender'],
        'recipient': values['recipient'],
        'credits': values['credits'],
        'block_index': index
    }), 201


@app.route('/retire', methods=['POST'])
def retire_credits():
    """
    Retire (burn) carbon credits permanently.
    Required: owner, credits
    Optional: reason
    """
    values = request.get_json()
    required = ['owner', 'credits']
    
    if not all(k in values for k in required):
        return jsonify({
            'error': 'Missing required values',
            'required': required
        }), 400

    if values['credits'] <= 0:
        return jsonify({
            'error': 'Credits must be greater than 0'
        }), 400

    # Retire (burn) the carbon credits
    index = blockchain.retire_credits(
        owner=values['owner'],
        credits=values['credits'],
        reason=values.get('reason')
    )
    
    return jsonify({
        'message': f'Carbon credits retired (burned) and scheduled for Block No. {index}',
        'owner': values['owner'],
        'credits': values['credits'],
        'reason': values.get('reason'),
        'block_index': index
    }), 201


@app.route('/chain', methods=['GET'])
def full_chain():
    """Get the full blockchain"""
    return jsonify({
        'chain': blockchain.chain,
        'length': len(blockchain.chain)
    }), 200


@app.route('/chain/length', methods=['GET'])
def chain_length():
    """Get the length of the blockchain"""
    return jsonify({
        'length': len(blockchain.chain)
    }), 200


@app.route('/stats', methods=['GET'])
def get_stats():
    """Get blockchain statistics"""
    total_credits = 0
    total_transactions = 0
    issued_credits = 0
    
    for block in blockchain.chain:
        for transaction in block.get('transactions', []):
            total_transactions += 1
            credits = transaction.get('credits', 0)
            total_credits += credits
            if transaction.get('sender') == '0':
                issued_credits += credits
    
    return jsonify({
        'total_blocks': len(blockchain.chain),
        'total_transactions': total_transactions,
        'total_credits_issued': issued_credits,
        'pending_transactions': len(blockchain.current_transactions),
        'last_block_hash': blockchain.hash(blockchain.last_block) if blockchain.chain else None
    }), 200


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)