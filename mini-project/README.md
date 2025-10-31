# Carbon Credits Blockchain

A blockchain-based system for tracking and transferring carbon credits (carbon offsets). This project implements a simplified blockchain to demonstrate how carbon credits can be issued, tracked, and transferred in a transparent and immutable way.

## Features

- **Issue Carbon Credits**: Issue new carbon credits from carbon offset projects (e.g., renewable energy, reforestation, carbon capture)
- **Transfer Credits**: Transfer carbon credits between parties
- **Blockchain Validation**: Proof of Work consensus mechanism to validate blocks
- **Transparent Tracking**: Immutable ledger of all carbon credit transactions
- **RESTful API**: Easy-to-use API endpoints for all operations

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

The server will start on `http://0.0.0.0:5000`

## API Endpoints

### `GET /`
Get API information and available endpoints.

### `POST /issue`
Issue new carbon credits from a project.

**Request Body:**
```json
{
    "recipient": "company_abc",
    "credits": 100,
    "project_type": "renewable_energy",
    "description": "Solar farm in Texas generating 50MW"
}
```

### `POST /transfer`
Transfer carbon credits between parties.

**Request Body:**
```json
{
    "sender": "company_abc",
    "recipient": "company_xyz",
    "credits": 25,
    "project_type": "renewable_energy",
    "description": "Offset purchase for Q4 2024"
}
```

### `POST /validate`
Validate pending transactions and add a new block to the chain (performs proof of work).

### `GET /chain`
Get the full blockchain.

### `GET /chain/length`
Get the length of the blockchain.

### `GET /stats`
Get blockchain statistics including total credits issued, total transactions, etc.

## Example Usage

### Issue Carbon Credits
```bash
curl -X POST http://localhost:5000/issue \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "green_energy_corp",
    "credits": 500,
    "project_type": "renewable_energy",
    "description": "Wind farm project in California"
  }'
```

### Transfer Credits
```bash
curl -X POST http://localhost:5000/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "green_energy_corp",
    "recipient": "eco_retailer",
    "credits": 100,
    "description": "Bulk purchase for offset program"
  }'
```

### Validate Block
```bash
curl -X POST http://localhost:5000/validate
```

### Get Stats
```bash
curl http://localhost:5000/stats
```

## Project Types

Common carbon credit project types:
- `renewable_energy`: Solar, wind, hydroelectric projects
- `reforestation`: Tree planting and forest restoration
- `carbon_capture`: Direct air capture or carbon storage
- `energy_efficiency`: Energy saving initiatives
- `waste_management`: Landfill gas capture, recycling

## Online IDE Options for Running Flask

Here are some online IDEs where you can run this Flask server:

1. **Replit** (https://replit.com)
   - Free tier available
   - Built-in Python support
   - Easy Flask deployment
   - Shareable URLs

2. **CodeSandbox** (https://codesandbox.io)
   - Supports Python environments
   - Good for quick prototyping

3. **Gitpod** (https://gitpod.io)
   - Full VS Code experience in the browser
   - Can connect to GitHub repositories
   - Free tier available

4. **GitHub Codespaces** (https://github.com/features/codespaces)
   - Integrated with GitHub
   - Full VS Code environment
   - Requires GitHub account

5. **PythonAnywhere** (https://www.pythonanywhere.com)
   - Specifically designed for Python web apps
   - Free tier available
   - Easy Flask deployment

6. **Heroku** (https://www.heroku.com)
   - Cloud platform with free tier (limited)
   - Great for deploying Flask apps

**Recommended for this project**: **Replit** or **PythonAnywhere** as they have the easiest setup for Flask applications.

## How It Works

1. **Issue Credits**: When a carbon offset project is verified, credits are issued to the project owner
2. **Transfer Credits**: Credits can be transferred between parties (e.g., from project owner to a company buying offsets)
3. **Validate Blocks**: Transactions are bundled into blocks and validated using Proof of Work
4. **Immutable Ledger**: Once added, transactions cannot be altered, ensuring transparency and trust

## License

This is a demonstration project for educational purposes.

