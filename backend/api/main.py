from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router
from backend.seed.seed_data import seed_database
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed the mock database on startup
    seed_database()
    yield
    # Clean up on shutdown if necessary

app = FastAPI(
    title="SIH1620 Coordination Layer API",
    description="Predictive & City-Wide Coordination Layer over NextGen eHospital",
    lifespan=lifespan
)

# CORS configuration to allow React/Vite frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for hackathon local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {"status": "ok", "message": "SIH1620 API is running"}
