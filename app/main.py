from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os

from app.database import get_db, init_db, seed_data
from app.auth import authenticate_user, create_access_token, decode_token, DEMO_USERS

# Ensure DB is ready
init_db()
seed_data()

app = FastAPI(
    title="QYADA (قيادة) - Construction Enterprise Operating System API",
    description="Enterprise API powering QYADA ERP for UAE Construction Conglomerates",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Context State Class
class TenantContext(BaseModel):
    user_id: str
    company_id: int
    branch_id: int
    project_id: Optional[int] = None
    role: str
    lang: str = "ar"

class LoginRequest(BaseModel):
    username: str
    password: str

class SwitchContextRequest(BaseModel):
    company_id: int
    branch_id: Optional[int] = None
    project_id: Optional[int] = None

# Helper dependency to resolve current tenant context
def get_current_context(
    authorization: Optional[str] = Header(None),
    x_company_id: Optional[int] = Header(None, alias="X-Company-ID"),
    x_branch_id: Optional[int] = Header(None, alias="X-Branch-ID"),
    x_project_id: Optional[int] = Header(None, alias="X-Project-ID"),
    x_lang: Optional[str] = Header("ar", alias="X-Lang")
) -> TenantContext:
    if not authorization or not authorization.startswith("Bearer "):
        # Default fallback for seamless demo mode
        user = DEMO_USERS["admin"]
        return TenantContext(
            user_id=user["username"],
            company_id=x_company_id or user["company_id"],
            branch_id=x_branch_id or user["branch_id"],
            project_id=x_project_id,
            role=user["role"],
            lang=x_lang or "ar"
        )

    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return TenantContext(
        user_id=payload.get("sub", "admin"),
        company_id=x_company_id or payload.get("company_id", 1),
        branch_id=x_branch_id or payload.get("branch_id", 1),
        project_id=x_project_id or payload.get("project_id"),
        role=payload.get("role", "CEO"),
        lang=x_lang or "ar"
    )

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user["username"],
        "role": user["role"],
        "company_id": user["company_id"],
        "branch_id": user["branch_id"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me")
def get_me(ctx: TenantContext = Depends(get_current_context)):
    user = DEMO_USERS.get(ctx.user_id, DEMO_USERS["admin"])

    conn = get_db()
    c = conn.cursor()
    companies = c.execute("SELECT id, code, name_ar, name_en FROM companies").fetchall()
    branches = c.execute("SELECT id, company_id, code, name_ar, name_en, emirate FROM branches").fetchall()
    conn.close()

    return {
        "user": user,
        "active_context": ctx,
        "companies": [dict(comp) for comp in companies],
        "branches": [dict(br) for br in branches]
    }

from app.api_departments import router as departments_router
from app.ai_engine import router as ai_router

app.include_router(departments_router)
app.include_router(ai_router)

# Register static files directory for frontend
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/health")
def health_check():
    return {"status": "ok", "system": "QYADA Construction Enterprise OS"}
