from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base
from routes import ingest, analytics, inventory, recommendations

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="PRISMA API",
    description="Predictive Retail Intelligence & Sales Management Analytics",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(ingest.router)
app.include_router(analytics.router)
app.include_router(inventory.router)
app.include_router(recommendations.router)

@app.get("/")
def read_root():
    return {"message": "PRISMA Backend AI-Ready", "status": "online"}
