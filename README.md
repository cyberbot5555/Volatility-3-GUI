# Volatility 3 Web GUI

Web-based GUI for Volatility 3 memory forensics.

React (Vite + Tailwind) → FastAPI → Volatility 3 CLI

## Quick Start

### Prerequisites
- Python 3.12
- Node.js 20+
- Git

### Setup

```powershell
# Clone
git clone https://github.com/cyberbot5555/Volatility-3-GUI.git
cd volatility-web

# Volatility 3 (kept as sibling, not committed)
git clone https://github.com/volatilityfoundation/volatility3.git

# Backend
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install ..\volatility3

# Frontend
cd ..\frontend
npm install
