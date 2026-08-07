# Contributing to FuelLinkAI

Thank you for your interest in contributing to FuelLinkAI.

## Code of Conduct

Please read and follow our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating in this project.

## How to contribute

1. Fork the repository.
2. Create a feature branch.
3. Make your changes with clear, focused commits.
4. Ensure tests pass.
5. Open a pull request with a clear description of the change.

## Development setup

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest
```

### Frontend

```powershell
cd frontend
npm install
npm run lint
npm run type-check
npm run build
```

## Pull request guidelines

- Keep pull requests small and focused.
- Include tests when adding or changing behavior.
- Update documentation when necessary.
- Ensure CI checks pass before requesting review.

## Reporting issues

Please open an issue with:

- a clear description of the bug or feature request
- steps to reproduce
- expected behavior
- relevant environment details
