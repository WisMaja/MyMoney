from fastapi import APIRouter
from users.router import router
from typing import List



class Router:
    def __init__(self, router: APIRouter, tag: str):
        self.router = router
        self.tag = tag


# Add routers here
registered_routers: List[Router] = [
    Router(router=router, tag="Users"),
]