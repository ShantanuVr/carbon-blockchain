# Blockchain Flask API

A simple blockchain implementation using Flask that demonstrates core blockchain concepts including proof-of-work, transaction creation, and block mining.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Windows](#windows)
  - [Linux](#linux)
  - [macOS](#macos)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Proof-of-Work Algorithm**: Mines blocks using a simple proof-of-work consensus mechanism
- **Transaction Management**: Create and add transactions to the blockchain
- **Block Mining**: Mine new blocks with mining rewards
- **RESTful API**: Simple Flask-based REST API for blockchain operations

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.7+** (Python 3.8 or higher recommended)
- **pip** (Python package installer)

### Checking Your Python Installation

**Windows:**
```cmd
python --version
python -m pip --version
```

**Linux:**
```bash
python3 --version
python3 -m pip --version
```

**macOS:**
```bash
python3 --version
python3 -m pip --version
```

If Python is not installed, download it from [python.org](https://www.python.org/downloads/)

---

## 📦 Installation

### Windows

#### Option 1: Using Python venv (Recommended)

1. **Open Command Prompt or PowerShell**
   - Press `Win + R`, type `cmd` or `powershell`, and press Enter

2. **Navigate to the project directory**
   ```cmd
   cd path\to\carbon-blockchain
   ```

3. **Create a virtual environment**
   ```cmd
   python -m venv venv
   ```

4. **Activate the virtual environment**
   ```cmd
   venv\Scripts\activate
   ```
   You should see `(venv)` at the beginning of your command prompt.

5. **Upgrade pip (optional but recommended)**
   ```cmd
   python -m pip install --upgrade pip
   ```

6. **Install dependencies**
   ```cmd
   pip install -r requirements.txt
   ```

#### Option 2: Using Anaconda/Miniconda

1. **Open Anaconda Prompt**

2. **Navigate to the project directory**
   ```cmd
   cd path\to\carbon-blockchain
   ```

3. **Create a conda environment**
   ```cmd
   conda create -n blockchain python=3.10
   conda activate blockchain
   ```

4. **Install dependencies**
   ```cmd
   pip install -r requirements.txt
   ```

### Linux

#### Option 1: Using Python venv (Recommended)

1. **Open Terminal**
   - Press `Ctrl + Alt + T` or search for "Terminal" in your applications

2. **Navigate to the project directory**
   ```bash
   cd ~/path/to/carbon-blockchain
   ```

3. **Create a virtual environment**
   ```bash
   python3 -m venv venv
   ```

4. **Activate the virtual environment**
   ```bash
   source venv/bin/activate
   ```
   You should see `(venv)` at the beginning of your command prompt.

5. **Upgrade pip (optional but recommended)**
   ```bash
   python3 -m pip install --upgrade pip
   ```

6. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

#### Option 2: System-wide Installation (Not Recommended)

**Note:** This method installs packages globally. Use with caution.

```bash
sudo pip3 install -r requirements.txt
```

### macOS

#### Option 1: Using Python venv (Recommended)

1. **Open Terminal**
   - Press `Cmd + Space`, type "Terminal", and press Enter

2. **Navigate to the project directory**
   ```bash
   cd ~/path/to/carbon-blockchain
   ```

3. **Create a virtual environment**
   ```bash
   python3 -m venv venv
   ```

4. **Activate the virtual environment**
   ```bash
   source venv/bin/activate
   ```
   You should see `(venv)` at the beginning of your command prompt.

5. **Upgrade pip (optional but recommended)**
   ```bash
   python3 -m pip install --upgrade pip
   ```

6. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

#### Option 2: Using Homebrew (if Python not installed)

1. **Install Homebrew** (if not already installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Python via Homebrew**
   ```bash
   brew install python3
   ```

3. **Follow steps 2-6 from Option 1**

---

## 🚀 Running the Application

### All Platforms

1. **Activate your virtual environment** (if not already active)

   **Windows:**
   ```cmd
   venv\Scripts\activate
   ```

   **Linux/macOS:**
   ```bash
   source venv/bin/activate
   ```

2. **Start the Flask server**
   ```bash
   python main.py
   ```
   
   Or if using Python 3 explicitly:
   ```bash
   python3 main.py
   ```

3. **Verify the server is running**
   
   You should see output similar to:
   ```
   * Running on all addresses (0.0.0.0)
   * Running on http://127.0.0.1:5000
   * Running on http://[your-ip]:5000
   ```

4. **Access the API**
   
   - **Local access**: `http://localhost:5000`
   - **Network access**: `http://[your-ip]:5000`

### Changing the Port

If port 5000 is already in use, edit `main.py` and change the port:

```python
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)  # Change 5001 to any available port
```

---

## 📡 API Endpoints

### 1. Get Full Blockchain
**GET** `/chain`

Returns the complete blockchain.

**Example:**
```bash
curl -X GET http://localhost:5000/chain
```

**Response:**
```json
{
  "chain": "[{...block data...}]",
  "length": 1
}
```

### 2. Create New Transaction
**POST** `/transactions/new`

Adds a new transaction to the pending transactions pool.

**Request Body:**
```json
{
  "sender": "Alice",
  "recipient": "Bob",
  "amount": 50
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/transactions/new \
  -H "Content-Type: application/json" \
  -d '{"sender": "Alice", "recipient": "Bob", "amount": 50}'
```

**Response:**
```json
{
  "message": "Transaction is scheduled to be added to Block No. 2"
}
```

### 3. Mine a New Block
**GET** `/mine`

Mines a new block, including:
- A mining reward transaction (sender: "0")
- All pending transactions

**Example:**
```bash
curl -X GET http://localhost:5000/mine
```

**Response:**
```json
{
  "message": "The new block has been forged",
  "index": 2,
  "transactions": [...],
  "proof": 12345,
  "previous_hash": "..."
}
```

---

## 🧪 Testing

### Quick Test

1. **Start the server** (see [Running the Application](#-running-the-application))

2. **Test the endpoints** in a new terminal:

   **Get initial blockchain:**
   ```bash
   curl -X GET http://localhost:5000/chain
   ```

   **Create a transaction:**
   ```bash
   curl -X POST http://localhost:5000/transactions/new \
     -H "Content-Type: application/json" \
     -d '{"sender": "Alice", "recipient": "Bob", "amount": 50}'
   ```

   **Mine a block:**
   ```bash
   curl -X GET http://localhost:5000/mine
   ```

### Automated Test Script

**Linux/macOS:**

Run the provided test script:
```bash
chmod +x test_blockchain.sh
./test_blockchain.sh
```

**Windows (PowerShell):**

Create a PowerShell script or run commands manually in PowerShell:

```powershell
# Get blockchain
curl.exe -X GET http://localhost:5000/chain

# Create transaction
curl.exe -X POST http://localhost:5000/transactions/new `
  -H "Content-Type: application/json" `
  -d '{\"sender\": \"Alice\", \"recipient\": \"Bob\", \"amount\": 50}'

# Mine block
curl.exe -X GET http://localhost:5000/mine
```

### Using Python Requests

Create a test script `test_api.py`:

```python
import requests

BASE_URL = "http://localhost:5000"

# Get chain
response = requests.get(f"{BASE_URL}/chain")
print("Chain:", response.json())

# Create transaction
response = requests.post(
    f"{BASE_URL}/transactions/new",
    json={"sender": "Alice", "recipient": "Bob", "amount": 50}
)
print("Transaction:", response.json())

# Mine block
response = requests.get(f"{BASE_URL}/mine")
print("Mine:", response.json())
```

Run it:
```bash
python test_api.py
```

---

## 📁 Project Structure

```
carbon-blockchain/
├── main.py              # Flask application entry point
├── blockchain.py        # Blockchain implementation
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── TEST_COMMANDS.md    # Detailed test commands
├── test_blockchain.sh  # Automated test script (Linux/macOS)
└── venv/               # Virtual environment (created during setup)
```

---

## 🔍 Troubleshooting

### Issue: "python: command not found" or "python3: command not found"

**Solution:**
- Ensure Python is installed and added to your PATH
- Try using `python3` instead of `python` (Linux/macOS)
- Reinstall Python and check "Add Python to PATH" during installation (Windows)

### Issue: "pip: command not found"

**Solution:**
- Try `pip3` instead of `pip` (Linux/macOS)
- Install pip: `python -m ensurepip --upgrade` or `python3 -m ensurepip --upgrade`

### Issue: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
- Ensure your virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Issue: Port 5000 already in use

**Symptoms:**
```
OSError: [Errno 48] Address already in use
```

**Solution:**
1. Find the process using port 5000:
   
   **Windows:**
   ```cmd
   netstat -ano | findstr :5000
   ```
   
   **Linux/macOS:**
   ```bash
   lsof -i :5000
   ```

2. Kill the process or change the port in `main.py`:
   ```python
   app.run(host="0.0.0.0", port=5001)
   ```

### Issue: Virtual environment not activating

**Windows:**
- If activation fails, check execution policy:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- Try using `venv\Scripts\activate.bat` instead

**Linux/macOS:**
- Ensure you're using `source venv/bin/activate` (not `./venv/bin/activate`)

### Issue: "Permission denied" errors (Linux/macOS)

**Solution:**
- Don't use `sudo` with virtual environments
- Fix permissions: `chmod -R u+w venv`

### Issue: SSL Certificate Errors

**Solution:**
- Update pip: `python -m pip install --upgrade pip`
- Use trusted hosts: `pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt`

---

## 📝 Additional Resources

- **Flask Documentation**: https://flask.palletsprojects.com/
- **Python Virtual Environments**: https://docs.python.org/3/tutorial/venv.html
- **curl Documentation**: https://curl.se/docs/

## 📄 License

This project is for educational purposes.

---

## 🤝 Contributing

Feel free to submit issues or pull requests!

---

## 📧 Support

If you encounter any issues not covered in this README, please check:
1. Python version compatibility
2. Virtual environment activation
3. Network/firewall settings
4. Port availability

**Happy Blockchaining! 🔗**

