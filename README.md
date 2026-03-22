# Auto Educational Gist Creator

Turn any public or private GitHub repository into an AI-generated, developer-grade educational code review Gist in minutes.

[![Build Status](https://img.shields.io/badge/Build-Manual%20Run-informational?style=for-the-badge)](#getting-started)
[![Version](https://img.shields.io/badge/Version-v1.0.0-blue?style=for-the-badge)](#)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-2ea44f?style=for-the-badge)](LICENSE)
[![Coverage](https://img.shields.io/badge/Coverage-Not%20Configured-lightgrey?style=for-the-badge)](#testing)

> [!NOTE]
> This project currently ships as a lightweight Flask static host plus a browser-based orchestration client that calls the GitHub and Gemini APIs directly from the frontend.

## Table of Contents

- [Features](#features)
- [Tech Stack & Architecture](#tech-stack--architecture)
  - [Core Stack](#core-stack)
  - [Project Structure](#project-structure)
  - [Key Design Decisions](#key-design-decisions)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)
- [Contacts & Community Support](#contacts--community-support)

## Features

- Browser-first workflow for generating educational Markdown analyses from source code repositories.
- Integrates with the GitHub REST API to:
  - fetch repository metadata,
  - discover the default branch,
  - recursively traverse the repository tree,
  - fetch source file contents,
  - publish final Markdown output as a public Gist.
- Multi-model Gemini fallback strategy (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash`) to improve generation reliability.
- Smart first-pass file selection mechanism that:
  - targets common production code extensions,
  - excludes likely low-value files such as tests, minified bundles, and bootstrap configs.
- UTF-8-safe base64 decoding pipeline for downloaded file content before model submission.
- Prompt template tuned for senior-level engineering analysis and educational formatting.
- End-to-end progress log UI with timestamped events and clear failure reporting.
- Minimal backend footprint: Flask only serves static assets and root HTML entrypoint.
- No local repository cloning required for end users.
- Compatible with both public and private repositories (with appropriate GitHub token scopes).

> [!IMPORTANT]
> Required token permissions:
> - GitHub Personal Access Token must include `repo` (for private repos) and `gist`.
> - Gemini API key must be enabled for model content generation in your Google AI project.

## Tech Stack & Architecture

### Core Stack

- **Backend runtime:** Python 3 + Flask.
- **Frontend runtime:** Vanilla JavaScript (ES6+), HTML5, CSS3.
- **External APIs:**
  - GitHub REST API v3 (`/repos`, `/git/trees`, `/contents`, `/gists`),
  - Google Generative Language API (`v1beta/models/*:generateContent`).
- **Application pattern:** Thin server + rich client-side orchestration.

### Project Structure

```text
autoAI-gist-creator/
├── app.py                  # Flask bootstrap and root route
├── index.html              # Main UI (token inputs + trigger + logs)
├── LICENSE                 # Apache License 2.0
├── static/
│   ├── css/
│   │   └── style.css       # Dark theme and responsive UI styles
│   └── js/
│       └── app.js          # End-to-end workflow orchestration logic
└── templates/              # Reserved for Flask template expansion (currently unused)
```

### Key Design Decisions

1. **Client-side API orchestration for speed and simplicity**
   - All API calls happen in the browser, reducing backend complexity.
   - Tradeoff: user-provided credentials live in browser memory and are sent directly to third-party APIs.

2. **Heuristic-based file selection**
   - Reduces user friction by selecting a likely “interesting” code file automatically.
   - Tradeoff: in monorepos or unusual layouts, selected file may not be ideal.

3. **Model fallback for resilience**
   - Sequential model retries reduce hard failures caused by quota/model availability.
   - Tradeoff: longer response times when primary model fails.

4. **Frontend-first logging and observability**
   - Timestamped log output helps users troubleshoot API, auth, and network errors quickly.

> [!WARNING]
> Because requests are made from the browser, this project is best used in a trusted environment. For team or production-grade usage, consider moving token handling and API proxying to a secure backend.

## Getting Started

### Prerequisites

- **Python** `3.9+` (recommended `3.11+`).
- **pip** for dependency management.
- A modern browser (Chrome, Edge, Firefox, Safari).
- GitHub Personal Access Token with required scopes.
- Gemini API key.

### Installation

```bash
# 1) Clone the repository
git clone https://github.com/<your-org-or-user>/autoAI-gist-creator.git

# 2) Enter the project directory
cd autoAI-gist-creator

# 3) Create and activate a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 4) Install dependencies
pip install flask

# 5) Run the app
python app.py
```

Open your browser at `http://127.0.0.1:5000`.

> [!TIP]
> For reproducibility, pin dependencies in a `requirements.txt` file before onboarding a team or CI runners.

## Testing

This repository does not currently include a committed automated test suite. Use the following baseline verification commands:

```bash
# Syntax check for Python entrypoint
python -m py_compile app.py

# Optional: compile all Python files in the repo
python -m compileall .

# Smoke-test locally (run app in one terminal first)
curl -I http://127.0.0.1:5000/
```

Recommended future test matrix:

- **Unit tests:** file selection heuristics and prompt assembly behavior.
- **Integration tests:** mocked GitHub + Gemini API responses.
- **Linting/formatting:** `ruff`, `black`, and optional frontend linting via `eslint`.

> [!CAUTION]
> Avoid testing with real long-lived production tokens. Use short-lived or scoped sandbox credentials whenever possible.

## Deployment

### Production Readiness Guidelines

- Prefer running behind a reverse proxy (e.g., NGINX, Caddy) with HTTPS termination.
- Disable debug mode and run Flask through a production WSGI server (e.g., Gunicorn).
- Externalize runtime settings (port, host, debug flag) into environment variables.

Example production run:

```bash
pip install gunicorn flask
gunicorn --bind 0.0.0.0:8000 app:app
```

### CI/CD Integration (Suggested)

Typical pipeline stages:

1. Install dependencies.
2. Run syntax/static checks.
3. Execute tests (once present).
4. Build and publish container image.
5. Deploy behind environment-specific secrets management.

### Containerization Example (Optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir flask gunicorn
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

## Usage

1. Start the application and open it in your browser.
2. Paste your GitHub PAT and Gemini API key.
3. Enter repository slug in `owner/repo` format.
4. Click **Generate Code Review Gist**.
5. Monitor progress logs and open the generated Gist URL.

### Example Workflow Logic

```javascript
// Simplified conceptual flow from static/js/app.js
const repoMeta = await fetch(`https://api.github.com/repos/${repoPath}`, { headers: ghHeaders });
const defaultBranch = (await repoMeta.json()).default_branch;

const tree = await fetch(
  `https://api.github.com/repos/${repoPath}/git/trees/${defaultBranch}?recursive=1`,
  { headers: ghHeaders }
);

// Find a non-test, non-config source file candidate
const targetFile = pickBestCandidate((await tree.json()).tree);

// Download source and ask Gemini for a deep-dive educational markdown
const markdown = await generateEducationalAnalysis(targetFile, ghToken, geminiToken);

// Publish final result as a GitHub Gist and return URL to user
const gistUrl = await publishGist(markdown, ghToken);
```

### Practical Python Launch Example

```python
from app import app

if __name__ == "__main__":
    # Local development only; use Gunicorn/Uvicorn-compatible server in production
    app.run(host="127.0.0.1", port=5000, debug=True)
```

## Configuration

Although the current implementation uses UI inputs, production deployments should define environment-backed defaults.

### Environment Variables (Recommended)

| Variable | Required | Default | Description |
|---|---|---|---|
| `FLASK_HOST` | No | `127.0.0.1` | Bind host for Flask/Gunicorn. |
| `FLASK_PORT` | No | `5000` | HTTP port. |
| `FLASK_DEBUG` | No | `false` | Enables Flask debug mode (dev only). |
| `GITHUB_API_BASE` | No | `https://api.github.com` | GitHub REST API base URL. |
| `GEMINI_API_BASE` | No | `https://generativelanguage.googleapis.com` | Gemini API base URL. |

### Runtime Flags (Current)

- `python app.py` launches Flask in debug mode, as coded in `app.py`.

### Suggested `.env` Template

```env
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=true
GITHUB_API_BASE=https://api.github.com
GEMINI_API_BASE=https://generativelanguage.googleapis.com
```

> [!NOTE]
> API credentials are currently entered manually in the web interface and are not read from `.env` by default.

## License

This project is licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for the full legal text.

## Contacts & Community Support

## Support the Project

[![Patreon](https://img.shields.io/badge/Patreon-OstinFCT-f96854?style=flat-square&logo=patreon)](https://www.patreon.com/OstinFCT)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-fctostin-29abe0?style=flat-square&logo=ko-fi)](https://ko-fi.com/fctostin)
[![Boosty](https://img.shields.io/badge/Boosty-Support-f15f2c?style=flat-square)](https://boosty.to/ostinfct)
[![YouTube](https://img.shields.io/badge/YouTube-FCT--Ostin-red?style=flat-square&logo=youtube)](https://www.youtube.com/@FCT-Ostin)
[![Telegram](https://img.shields.io/badge/Telegram-FCTostin-2ca5e0?style=flat-square&logo=telegram)](https://t.me/FCTostin)

If you find this tool useful, consider leaving a star on GitHub or supporting the author directly.
