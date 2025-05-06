from fastapi import Request, Response, HTTPException, Cookie
from typing import Optional
from core.db_connection import supabase

ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"

def set_token_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(key=ACCESS_COOKIE_NAME, value=access_token, httponly=True, secure=False, samesite="lax")
    response.set_cookie(key=REFRESH_COOKIE_NAME, value=refresh_token, httponly=True, secure=False, samesite="lax")

def delete_token_cookies(response: Response):
    response.delete_cookie(ACCESS_COOKIE_NAME)
    response.delete_cookie(REFRESH_COOKIE_NAME)

def verify_access_token(token: str):
    result = supabase.auth.get_user(token)
    if result.get("error"):
        return None
    return result["user"]

def refresh_session_with_token(refresh_token: str):
    result = supabase.auth.refresh_session(refresh_token)
    if result.get("error"):
        return None
    return result["session"]

async def get_current_user_with_refresh(
    request: Request,
    response: Response,
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None)
):
    # 1. Sprawdź access_token
    if access_token:
        user = verify_access_token(access_token)
        if user:
            return user

    # 2. Odśwież sesję
    if refresh_token:
        session = refresh_session_with_token(refresh_token)
        if session:
            set_token_cookies(response, session["access_token"], session["refresh_token"])
            user = verify_access_token(session["access_token"])
            if user:
                return user

    # 3. Nie udało się
    raise HTTPException(status_code=401, detail="Not authenticated")
