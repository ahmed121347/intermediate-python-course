from datetime import datetime
from typing import Dict, Any, List, Optional
from app.database import get_db

def create_workflow_item(title_ar: str, title_en: str, requester: str, department: str, amount_aed: float = 0.0, priority: str = "Medium") -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    code = f"WF-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M")

    cursor.execute("""
    INSERT INTO workflows (workflow_code, title_ar, title_en, requester, department, amount_aed, priority, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?);
    """, (code, title_ar, title_en, requester, department, amount_aed, priority, created_at))

    wf_id = cursor.lastrowid

    # Audit log
    cursor.execute("""
    INSERT INTO audit_logs (user_name, action_ar, action_en, module, timestamp, details)
    VALUES (?, ?, ?, 'سير العمل', ?, ?);
    """, (requester, f"إنشاء طلب موافقة: {title_ar}", f"Created Workflow Request: {title_en}", created_at, f"المبلغ: {amount_aed} AED"))

    conn.commit()
    conn.close()
    return {"id": wf_id, "workflow_code": code, "status": "Pending"}

def process_workflow_action(workflow_id: int, action: str, user_name: str, comments: Optional[str] = None) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM workflows WHERE id = ?;", (workflow_id,))
    wf = cursor.fetchone()
    if not wf:
        conn.close()
        return {"error": "Workflow request not found"}

    new_status = "Approved" if action.lower() == "approve" else "Rejected"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    cursor.execute("UPDATE workflows SET status = ? WHERE id = ?;", (new_status, workflow_id))

    # Audit Trail Entry
    action_ar = f"اعتماد الطلب ({wf['title_ar']})" if new_status == "Approved" else f"رفض الطلب ({wf['title_ar']})"
    action_en = f"Approved Request ({wf['title_en']})" if new_status == "Approved" else f"Rejected Request ({wf['title_en']})"

    cursor.execute("""
    INSERT INTO audit_logs (user_name, action_ar, action_en, module, timestamp, details)
    VALUES (?, ?, ?, 'سير العمل والاعتمادات', ?, ?);
    """, (user_name, action_ar, action_en, now_str, f"ملاحظات: {comments or 'بدون ملاحظات'}"))

    conn.commit()
    conn.close()

    return {
        "id": workflow_id,
        "workflow_code": wf["workflow_code"],
        "status": new_status,
        "processed_by": user_name,
        "timestamp": now_str
    }

def get_pending_workflows() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM workflows WHERE status = 'Pending' ORDER BY id DESC;")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
