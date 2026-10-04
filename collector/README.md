# Collector

Minimal Python 3.13 package scaffold. No collection logic yet.

## Virtual environment setup (Windows PowerShell)

```powershell
cd collector
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
```

On macOS/Linux, use `python3.13 -m venv .venv` and `source .venv/bin/activate`.

## Run and test

```powershell
access-risk-collector
pytest
```

## Lockfile

`pylock.toml` (PEP 751) records exact versions and hashes of the dev dependencies.
Regenerate it after changing dependencies in `pyproject.toml`:

```powershell
python -m pip lock -e ".[dev]" -o pylock.toml
```
