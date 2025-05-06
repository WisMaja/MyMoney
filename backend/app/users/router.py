from fastapi import APIRouter, Response, HTTPException, Depends, Cookie
from pydantic import BaseModel, EmailStr
from typing import Optional
from users.service import (
    register_user,
    login_user,
    logout_user,
    refresh_user_session,
)
from users.auth import get_current_user_with_refresh

router = APIRouter(prefix="/users")

# MODELE
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    surname: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ENDPOINTY
@router.post("/register")
def register(request: RegisterRequest):
    return register_user(request.email, request.password, request.name, request.surname)

@router.post("/login")
def login(request_data: LoginRequest, response: Response):
    return login_user(request_data.email, request_data.password, response)

@router.post("/logout")
def logout(response: Response):
    return logout_user(response)

@router.post("/refresh")
def refresh(response: Response, refresh_token: Optional[str] = Cookie(None)):
    return refresh_user_session(response, refresh_token)

@router.get("/me")
def get_me(user=Depends(get_current_user_with_refresh)):
    return {"user": user}

@router.get("/protected")
def protected_route(user=Depends(get_current_user_with_refresh)):
    return {"message": f"Hello, {user['email']}! This is a protected route."}
