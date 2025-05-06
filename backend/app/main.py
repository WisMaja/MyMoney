from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.routers import registered_routers

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    print("Shutting down")

app = FastAPI(docs_url="/", lifespan=lifespan)

origins = [
    "http://localhost:3000",  
    "http://127.0.0.1:3000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,       # <--- dla ciasteczek
    allow_methods=["*"],          # <--- pozwala na POST, GET, OPTIONS, itd.
    allow_headers=["*"],          # <--- pozwala na nagłówki typu Content-Type
)

for route in registered_routers:
    app.include_router(route.router, tags=[route.tag])
