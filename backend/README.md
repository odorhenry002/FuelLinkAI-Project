# Backend README

## FuelLink AI Backend

FastAPI + SQLAlchemy + PostgreSQL

### Project Structure

```
app/
├── models/       # SQLAlchemy Database Models
├── schemas/      # Pydantic Request/Response Schemas
├── routers/      # API Route Handlers
├── services/     # Business Logic Layer
├── middleware/   # Request/Response Middleware
├── utils/        # Utility Functions
├── config.py     # Configuration Settings
└── main.py       # FastAPI Application
```

### Getting Started

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` file from `.env.example`

4. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

5. Access API documentation:
   - Swagger UI: http://localhost:8000/api/docs
   - ReDoc: http://localhost:8000/api/redoc

### Database Setup

1. Install PostgreSQL
2. Create database:
   ```bash
   createdb fuellink_db
   ```

3. Update `.env` with DATABASE_URL

### Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (change in production)
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key

### Architecture

- **Clean Architecture** - Separation of concerns
- **Dependency Injection** - FastAPI dependencies
- **Async/Await** - Asynchronous operations
- **JWT Authentication** - Secure token-based auth
- **SQLAlchemy ORM** - Type-safe database queries

### Security Features

- ✅ Password Hashing (bcrypt)
- ✅ JWT Token Authentication
- ✅ CORS Configuration
- ✅ SQL Injection Prevention
- ✅ XSS Protection
- ✅ HTTPS Ready

### Available Endpoints

- `GET /` - Health check
- `GET /api/health` - API health status
- `GET /api/docs` - Swagger documentation
- `GET /api/redoc` - ReDoc documentation

### Development

- Black - Code formatter
- Flake8 - Linter
- MyPy - Type checker
- Pytest - Testing framework

Run tests:
```bash
pytest
```

### Deployment

Ready for deployment on:
- AWS (EC2, ECS, Lambda)
- Docker
- Heroku
