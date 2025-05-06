from fastapi import HTTPException, Response
from typing import Optional
from core.db_connection import supabase
from users.auth import set_token_cookies, delete_token_cookies, refresh_session_with_token


def register_user(email: str, password: str, name: str, surname: str):
    try:
        result = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "name": name,
                    "surname": surname
                }
            }
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "User registered. Please check your email."}
    result = supabase.auth.sign_up({
        "email": email,
        "password": password,
        "options": {
            "data": {
                "name": name,
                "surname": surname
            }
        }
    })

    if result.erro is not None:
        raise HTTPException(status_code=400, detail=result["error"]["message"])

    return {"message": "User registered. Please check your email."}


def login_user(email: str, password: str, response: Response):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    session = result.session
    set_token_cookies(response, session.access_token, session.refresh_token)
    return {"message": "Logged in successfully"}
    result = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })

    if result.get.error is not None:
        raise HTTPException(status_code=401, detail=result["error"]["message"])

    session = result["session"]
    set_token_cookies(response, session["access_token"], session["refresh_token"])
    return {"message": "Logged in successfully"}


def logout_user(response: Response):
    delete_token_cookies(response)
    return {"message": "Logged out"}


def refresh_user_session(response: Response, refresh_token: Optional[str]):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token provided")

    session = refresh_session_with_token(refresh_token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    set_token_cookies(response, session["access_token"], session["refresh_token"])
    return {"message": "Session refreshed"}
