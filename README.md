<div align="center">

# 🧠 Volatility 3 Web GUI

**A local-first web application for Windows memory forensics using Volatility 3**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Volatility 3](https://img.shields.io/badge/Volatility-3-8B0000?style=flat-square)](https://github.com/volatilityfoundation/volatility3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Overview](#-overview) • [Features](#-features) • [Architecture](#-architecture) • [Setup](#-setup) • [Usage](#-usage) • [API](#-api-reference) • [Security](#-security)

</div>

---

## 📖 Overview

**Volatility 3 Web GUI** is a self-hosted web application that brings the power of the [Volatility 3](https://github.com/volatilityfoundation/volatility3) memory forensics framework into a clean, modern dashboard.

Volatility 3 is the industry-standard tool for analyzing memory dumps — but it's CLI-only, requiring analysts to memorize dozens of plugin names, flags, and output formats. This project wraps it in a professional DFIR interface so you can:

- **Upload** a Windows memory image
- **Select** a plugin from a searchable dropdown
- **Run** the analysis with one click
- **Explore** structured results with search, sort, and export

No more copy-pasting commands from a cheat sheet. No more parsing raw terminal output in Excel. Just a fast, focused triage workflow.

> **Status:** Portfolio-ready MVP (Phase 1–3 complete). See [Roadmap](#-roadmap) for planned features.

---

## ✨ Features

### 🖼️ Memory Image Management
- Upload via drag-and-drop or file picker
- Supports `.raw`, `.mem`, `.dmp`, `.vmem`, `.img`, `.dd` formats
- File size and extension validation
- List, select, and delete previously uploaded images
- Streaming upload with progress indicator

### 🔌 Plugin Selection
- Searchable dropdown with descriptions
- Whitelisted plugins only (no arbitrary command execution)
- Currently supported plugins:

| Plugin ID | Volatility Plugin | Purpose |
|---|---|---|
| `pslist` | `windows.pslist` | List active processes |
| `pstree` | `windows.pstree` | Show parent/child process tree |
| `netscan` | `windows.netscan` | Enumerate network connections |
| `cmdline` | `windows.cmdline` | Retrieve process command lines |
| `malfind` | `windows.malfind` | Detect injected/hidden code |

### 📊 Results Dashboard
- **Table view** — sortable columns, searchable rows, expandable detail
- **Raw view** — fixed-width terminal-style output
- **JSON view** — structured payload for automation
- **Copy to clipboard** — for reports
- **CSV export** — for further analysis in Excel/Splunk

### 🎨 UX & Status
- Clear state machine: `Idle → Preparing → Running → Completed / Failed`
- Loading spinner and progress indication
- Run button disabled while analysis is in progress
- User-friendly error messages (never raw Python tracebacks)

### 🔒 Security-First Design
- **Plugin whitelist** — only pre-approved plugins can be executed
- **No `shell=True`** — subprocess calls use argument lists only
- **Path traversal protection** — filename sanitization + directory confinement
- **File validation** — extension and size checks before analysis
- **Subprocess timeout** — prevents runaway processes
- **Safe output directory** — results confined to project workspace

---

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Frontend    │  Vite + Tailwind + Axios
│   localhost:5173    │
└──────────┬──────────┘
           │  HTTP  (JSON)
           ▼
┌─────────────────────┐
│  FastAPI Backend    │  Uvicorn + Pydantic
│   localhost:8000    │
└──────────┬──────────┘
           │  subprocess.run(arg_list, shell=False)
           ▼
┌─────────────────────┐
│   Volatility 3 CLI  │  vol.py -f <image> -r json <plugin>
└──────────┬──────────┘
           │  stdout (JSON)
           ▼
┌─────────────────────┐
│  Parser + Validator │  JSON → {columns, rows}
└──────────┬──────────┘
           │
           ▼
      Results Table
```

### Project Structure

```
volatility-web/
├── backend/                        # FastAPI application
│   ├── api/
│   │   └── routes.py               # REST endpoints
│   ├── volatility/
│   │   ├── plugins.py              # Plugin whitelist
│   │   ├── runner.py               # Safe subprocess execution
│   │   └── parser.py               # JSON → structured rows
│   ├── utils/
│   │   └── validation.py           # Filename / path / size checks
│   ├── config.py                   # Paths, limits, constants
│   ├── main.py                     # FastAPI entry point
│   └── requirements.txt
│
├── frontend/                       # React + Vite application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/
│   │   │   └── Dashboard.jsx       # Main workspace
│   │   ├── hooks/
│   │   │   └── useHealth.js        # Backend health poll
│   │   ├── services/
│   │   │   └── api.js              # Axios wrapper
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── volatility3/                    # Volatility 3 (cloned separately)
├── memory/                         # Uploaded memory images (gitignored)
├── output/                         # Exported artifacts (gitignored)
├── package.json                    # One-command startup
└── README.md
```

---

## 🚀 Setup

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Python** | 3.12 (recommended) | 3.13+ may lack prebuilt wheels for `pydantic-core` |
| **Node.js** | 20 LTS or newer | Includes `npm` |
| **Git** | Latest | For cloning Volatility 3 |

### 1. Clone this repository

```powershell
git clone https://github.com/cyberbot5555/Volatility-3-GUI.git volatility-web
cd volatility-web
```

### 2. Clone Volatility 3 (as a sibling folder)

```powershell
git clone https://github.com/volatilityfoundation/volatility3.git
```

### 3. Backend setup

```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install ..\volatility3
python -m uvicorn main:app --reload --port 8000
```

### 4. Frontend setup

```powershell
cd ..\frontend
npm install
```

---

## 🎮 Usage

### Development mode (two terminals)

**Terminal 1 — Backend:**

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**

```powershell
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### One-command startup (from project root)

```powershell
npm install       # first time only
npm run start
```

This launches both the FastAPI backend and the Vite dev server concurrently.

### Typical workflow

1. Open **http://localhost:5173**
2. **Upload** a memory image (or select one already on the server)
3. Choose a **plugin** from the dropdown — start with `windows.pslist`
4. Click **RUN ANALYSIS**
5. Explore results in the **Table**, **Raw**, or **JSON** view
6. Click **CSV** to export results for further analysis

---

## 🔌 API Reference

Base URL: `http://127.0.0.1:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns `{"status": "ok"}` |
| `GET` | `/api/plugins` | List of whitelisted plugins |
| `GET` | `/api/images` | List of uploaded memory images |
| `POST` | `/api/images/upload` | Upload a memory image (multipart) |
| `DELETE` | `/api/images/{name}` | Delete a memory image |
| `POST` | `/api/volatility/run` | Execute a Volatility plugin |

### Example: run `windows.pslist`

**Request:**

```http
POST /api/volatility/run
Content-Type: application/json

{
  "image": "MemoryDump.mem",
  "plugin": "pslist"
}
```

**Response:**

```json
{
  "status": "success",
  "plugin": "pslist",
  "image": "MemoryDump.mem",
  "columns": ["PID", "PPID", "ImageFileName", "Offset(V)", "Threads", "..."],
  "rows": [
    { "PID": 4, "PPID": 0, "ImageFileName": "System", "..." : "..." },
    { "PID": 108, "PPID": 4, "ImageFileName": "Registry", "..." : "..." }
  ],
  "raw": "PID   PPID  ImageFileName   ...",
  "stderr": "",
  "command": "python vol.py -f ... -r json windows.pslist"
}
```

### Interactive docs

FastAPI auto-generates OpenAPI documentation:

- Swagger UI: **http://127.0.0.1:8000/docs**
- ReDoc: **http://127.0.0.1:8000/redoc**

---

## 🔒 Security

This project executes a third-party CLI tool based on user input. Every layer is designed to prevent command injection and resource abuse.

| Control | Implementation |
|---|---|
| **Plugin whitelist** | Only plugins in `backend/volatility/plugins.py` can be invoked |
| **No shell** | `subprocess.run(cmd_list, shell=False)` — never string concatenation |
| **Argument list** | Command built as `list[str]`, no interpolation |
| **Filename sanitization** | Regex-validated, no path separators, no leading dot |
| **Path traversal protection** | Resolved path must stay inside `memory/` directory |
| **Extension validation** | Only `.raw`, `.mem`, `.dmp`, `.vmem`, `.img`, `.dd` allowed |
| **Size limit** | 8 GB hard cap per upload |
| **Timeout** | 600-second subprocess timeout (configurable in `config.py`) |
| **Error sanitization** | Raw stack traces never sent to the client |

> ⚠️ **This application has no authentication.** It is designed for **local use only**. Do not expose it to the public internet without adding authentication and rate limiting.

---

## 🧪 Tested With

- **Sample image:** Windows 10 memory dump (Redline challenge)
- **Volatility version:** 3.2.28
- **OS:** Windows 11, Python 3.12, Node 20

Successfully analyzed:
- ✅ Process list (~90 processes)
- ✅ Process tree
- ✅ Network connections
- ✅ Command lines
- ✅ Malware injection candidates

---

## 🗺️ Roadmap

### ✅ Phase 1 — Skeleton *(complete)*
- React + Vite frontend
- FastAPI backend
- Health endpoint
- Plugin dropdown

### ✅ Phase 2 — Core functionality *(complete)*
- Memory image upload and selection
- Plugin validation
- Safe Volatility execution
- Structured result display

### ✅ Phase 3 — Usability *(complete)*
- Plugin-specific options
- Result parsing (table / raw / JSON)
- Search, sort, filter
- CSV export

### 🔜 Phase 4 — Real-time & History *(planned)*
- WebSocket streaming for live output
- Job manager with cancel/stop
- SQLite scan history
- Bookmark & annotation support

### 🔮 Phase 5 — Production *(future)*
- Docker-isolated Volatility workers
- User authentication
- PDF investigation reports
- Timeline & process-tree visualizations
- IOC extraction
- Multi-image comparison

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/netscan-improvement`)
3. Commit your changes (`git commit -m 'Add netscan CSV export'`)
4. Push to the branch (`git push origin feature/netscan-improvement`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Volatility Foundation](https://github.com/volatilityfoundation/volatility3) — the memory forensics framework
- [FastAPI](https://fastapi.tiangolo.com/) — modern Python web framework
- [Vite](https://vitejs.dev/) — blazing-fast frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS framework

---

<div align="center">

**Built with ❤️ for the DFIR community**

[⬆ Back to top](#-volatility-3-web-gui)

</div>