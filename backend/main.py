from fastapi import FastAPI
from contextlib import asynccontextmanager

from core.routers import registered_routers

@asynccontextmanager
async def lifespan(app: FastAPI):
    # on_startup

    yield 

    # on_shutdown
    print("Shutting down")

app = FastAPI(docs_url="/", lifespan=lifespan)

for route in registered_routers:
    app.include_router(route.router, tags=[route.tag])

#komentarz
# origins = [
#     "http://localhost:3000",
#     "http://localhost:8000",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
