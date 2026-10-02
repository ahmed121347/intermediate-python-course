from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.main import get_current_context, TenantContext
from app.workflow import process_workflow_action, create_workflow_item, get_pending_workflows

router = APIRouter(prefix="/api/departments", tags=["Departments"])

class ActionRequest(BaseModel):
    action: str # Approve / Reject
    comments: Optional[str] = None

class CreateWorkflowReq(BaseModel):
    title_ar: str
    title_en: str
    department: str
    amount_aed: float = 0.0
    priority: str = "Medium"

@router.get("/executive/dashboard")
def get_executive_dashboard(ctx: TenantContext = Depends(get_current_context)):
    conn = get_db()
    c = conn.cursor()

    # Financial metrics
    projects = c.execute("SELECT * FROM projects WHERE branch_id IN (SELECT id FROM branches WHERE company_id = ? or ? = 1);", (ctx.company_id, ctx.company_id)).fetchall()

    total_revenue = sum(p["revenue_aed"] for p in projects)
    total_budget = sum(p["budget_aed"] for p in projects)
    total_cost = sum(p["actual_cost_aed"] for p in projects)
    total_profit = sum(p["profit_aed"] for p in projects)
    total_cash = sum(p["cash_collected_aed"] for p in projects)

    invoices = c.execute("SELECT * FROM invoices WHERE company_id = ? OR ? = 1;", (ctx.company_id, ctx.company_id)).fetchall()
    receivables = sum(inv["total_aed"] for inv in invoices if inv["type"] == "Receivable" and inv["status"] == "Unpaid")
    payables = sum(inv["total_aed"] for inv in invoices if inv["type"] == "Payable" and inv["status"] == "Pending Approval")

    # Audit log
    audit_logs = c.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10;").fetchall()

    # Pending Workflows
    pending_wf = get_pending_workflows()

    conn.close()

    return {
        "kpis": {
            "total_revenue_aed": total_revenue,
            "total_budget_aed": total_budget,
            "total_actual_cost_aed": total_cost,
            "total_profit_aed": total_profit,
            "total_cash_aed": total_cash,
            "receivables_aed": receivables,
            "payables_aed": payables,
            "active_projects_count": len(projects)
        },
        "projects": [dict(p) for p in projects],
        "pending_workflows": pending_wf,
        "recent_audit_logs": [dict(a) for a in audit_logs]
    }

@router.get("/projects")
def get_projects(ctx: TenantContext = Depends(get_current_context)):
    conn = get_db()
    c = conn.cursor()
    projects = c.execute("SELECT * FROM projects;").fetchall()
    conn.close()
    return [dict(p) for p in projects]

@router.get("/boq/{project_id}")
def get_boq_items(project_id: int):
    conn = get_db()
    c = conn.cursor()
    boq = c.execute("SELECT * FROM boq_items WHERE project_id = ?;", (project_id,)).fetchall()
    conn.close()
    return [dict(b) for b in boq]

@router.get("/factories/overview")
def get_factories_overview():
    conn = get_db()
    c = conn.cursor()
    lines = c.execute("SELECT * FROM manufacturing_lines;").fetchall()
    batches = c.execute("""
    SELECT pb.*, p.name_ar as project_name_ar, p.name_en as project_name_en
    FROM production_batches pb
    LEFT JOIN projects p ON pb.project_id = p.id;
    """).fetchall()
    conn.close()
    return {
        "lines": [dict(l) for l in lines],
        "batches": [dict(b) for b in batches]
    }

@router.get("/fleet")
def get_fleet_logistics():
    conn = get_db()
    c = conn.cursor()
    fleet = c.execute("""
    SELECT f.*, p.name_ar as project_name_ar, p.name_en as project_name_en
    FROM fleet_vehicles f
    LEFT JOIN projects p ON f.assigned_project_id = p.id;
    """).fetchall()
    conn.close()
    return [dict(f) for f in fleet]

@router.get("/hr")
def get_hr_payroll():
    conn = get_db()
    c = conn.cursor()
    employees = c.execute("SELECT * FROM employees;").fetchall()
    conn.close()
    return [dict(e) for e in employees]

@router.post("/workflows/{workflow_id}/action")
def workflow_action(workflow_id: int, req: ActionRequest, ctx: TenantContext = Depends(get_current_context)):
    res = process_workflow_action(workflow_id, req.action, ctx.user_id, req.comments)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.post("/workflows/create")
def workflow_create(req: CreateWorkflowReq, ctx: TenantContext = Depends(get_current_context)):
    res = create_workflow_item(
        title_ar=req.title_ar,
        title_en=req.title_en,
        requester=ctx.user_id,
        department=req.department,
        amount_aed=req.amount_aed,
        priority=req.priority
    )
    return res
