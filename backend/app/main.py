import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .seed import seed
from .routers import products, auth, cart, orders

Base.metadata.create_all(bind=engine)
seed(reset=False)

app = FastAPI(title="Myntra-style E-commerce API", version="1.0.0")

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
extra_origin = os.environ.get("FRONTEND_ORIGIN")
allow_origins = default_origins + [extra_origin] if extra_origin else default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(auth.router)
app.include_router(cart.router)
app.include_router(orders.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
