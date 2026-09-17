# Duopoly Pricing Dashboard

Agent-based simulation where two or more dynamic pricing algorithms compete in a simulated duopoly market.

## Overview

Simulates market environment where pricing agents set prices based on real-time demand elasticity to test whether the algorithms achieve tacit collusion (charging supra-competitive prices without explicitly communicating).

## Tech stack
- Language: Python 3.11
- API framework: FastAPI
- Validation: Pydantic
- Server: Uvicorn
- Testing: pytest

## Status
Under active development. Current progress:

- [x] Set up basic market environment simulation
- [] Interactive React dashboard to adjust market parameters

## Running locally

### Backend
1. Clone the repository and navigate to the project directory
2. Create and activate a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```
3. Install dependencies:
```bash
pip install fastapi uvicorn pydantic
# pip install -r requirements.txt
```
4. Start the development server:
```bash
uvicorn main:app --reload
```

Open the interactive API documentation at http://localhost:8000/docs. This can be changed in client/src/config.js.

## Background

Designed to inform modern antitrust litigation surrounding automated dynamic pricing platforms.

## Screenshots
![Duopoly Pricing screenshot] Coming soon!