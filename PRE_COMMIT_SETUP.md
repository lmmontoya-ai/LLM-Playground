# Pre-commit Setup

This project uses [pre-commit](https://pre-commit.com/) to automatically check and format code before commits.

## Installation

1. Install pre-commit (if not already installed):
```bash
pip install pre-commit
```

2. Install the git hook scripts:
```bash
pre-commit install
```

## What it does

The pre-commit configuration includes:

- **General checks**: Trailing whitespace, file endings, YAML syntax, large files
- **Python (backend)**: Black (formatter), isort (import sorting), flake8 (linter)
- **TypeScript/JavaScript (frontend)**: ESLint

## Usage

The hooks will run automatically when you run `git commit`.

To manually run all hooks on all files:
```bash
pre-commit run --all-files
```

To run hooks only on staged files:
```bash
pre-commit run
```

To skip hooks for a specific commit (not recommended):
```bash
git commit --no-verify
```

## Updating hooks

To update to the latest hook versions:
```bash
pre-commit autoupdate
```
