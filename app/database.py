import sqlite3
import os
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "qyada_erp.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Companies
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        currency TEXT DEFAULT 'AED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Branches
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        emirate TEXT NOT NULL,
        FOREIGN KEY (company_id) REFERENCES companies (id)
    );
    """)

    # Projects
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branch_id INTEGER NOT NULL,
        code TEXT UNIQUE NOT NULL,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        status TEXT NOT NULL,
        progress REAL DEFAULT 0,
        budget_aed REAL NOT NULL,
        actual_cost_aed REAL DEFAULT 0,
        committed_cost_aed REAL DEFAULT 0,
        revenue_aed REAL DEFAULT 0,
        profit_aed REAL DEFAULT 0,
        cash_collected_aed REAL DEFAULT 0,
        risk_level TEXT DEFAULT 'Low',
        delay_days INTEGER DEFAULT 0,
        manager_name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        start_date TEXT,
        end_date TEXT,
        FOREIGN KEY (branch_id) REFERENCES branches (id)
    );
    """)

    # BOQs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS boq_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        item_code TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        description_en TEXT NOT NULL,
        unit TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit_rate_aed REAL NOT NULL,
        total_amount_aed REAL NOT NULL,
        executed_qty REAL DEFAULT 0,
        FOREIGN KEY (project_id) REFERENCES projects (id)
    );
    """)

    # Invoices & VAT (UAE 5% VAT)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        project_id INTEGER,
        invoice_no TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL, -- Receivable / Payable
        entity_name TEXT NOT NULL,
        subtotal_aed REAL NOT NULL,
        vat_amount_aed REAL NOT NULL, -- 5% UAE VAT
        total_aed REAL NOT NULL,
        status TEXT NOT NULL, -- Paid, Unpaid, Pending Approval
        due_date TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        FOREIGN KEY (company_id) REFERENCES companies (id),
        FOREIGN KEY (project_id) REFERENCES projects (id)
    );
    """)

    # Manufacturing Lines (Marble & Steel Factories)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS manufacturing_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        factory_type TEXT NOT NULL, -- Marble / Steel
        line_code TEXT UNIQUE NOT NULL,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        daily_capacity TEXT NOT NULL,
        utilization_pct REAL DEFAULT 85.0,
        status TEXT DEFAULT 'Operational'
    );
    """)

    # Production Batches
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS production_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        factory_type TEXT NOT NULL,
        batch_no TEXT UNIQUE NOT NULL,
        line_id INTEGER NOT NULL,
        project_id INTEGER,
        product_name_ar TEXT NOT NULL,
        product_name_en TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        completion_pct REAL DEFAULT 0,
        status TEXT NOT NULL,
        delivery_date TEXT,
        FOREIGN KEY (line_id) REFERENCES manufacturing_lines (id),
        FOREIGN KEY (project_id) REFERENCES projects (id)
    );
    """)

    # Heavy Fleet & Transportation
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fleet_vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_code TEXT UNIQUE NOT NULL,
        plate_no TEXT UNIQUE NOT NULL,
        type_ar TEXT NOT NULL,
        type_en TEXT NOT NULL,
        assigned_project_id INTEGER,
        driver_name TEXT NOT NULL,
        status TEXT NOT NULL, -- Active, Maintenance, Idle
        fuel_efficiency TEXT NOT NULL,
        gps_lat REAL,
        gps_lng REAL,
        FOREIGN KEY (assigned_project_id) REFERENCES projects (id)
    );
    """)

    # HR & Payroll (UAE WPS)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        emp_code TEXT UNIQUE NOT NULL,
        name_ar TEXT NOT NULL,
        name_en TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        basic_salary_aed REAL NOT NULL,
        allowances_aed REAL NOT NULL,
        total_salary_aed REAL NOT NULL,
        wps_status TEXT DEFAULT 'Compliant',
        emirates_id TEXT NOT NULL,
        FOREIGN KEY (company_id) REFERENCES companies (id)
    );
    """)

    # Workflows & Approvals
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_code TEXT UNIQUE NOT NULL,
        title_ar TEXT NOT NULL,
        title_en TEXT NOT NULL,
        requester TEXT NOT NULL,
        department TEXT NOT NULL,
        amount_aed REAL DEFAULT 0,
        priority TEXT DEFAULT 'Medium', -- High, Medium, Low
        status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
        created_at TEXT NOT NULL
    );
    """)

    # Audit Trail
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        action_ar TEXT NOT NULL,
        action_en TEXT NOT NULL,
        module TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT
    );
    """)

    conn.commit()
    conn.close()

def seed_data():
    conn = get_db()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM companies;")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # Seed Companies
    companies_data = [
        ("QYADA-HOLDING", "مجموعة قيادة القابضة ش.م.ح", "QYADA Holding Group PJSC", "AED"),
        ("QYADA-CONST", "قيادة للمقاولات العامة ذ.م.م", "QYADA General Contracting LLC", "AED"),
        ("QYADA-MARBLE", "قيادة لمصانع الرخام والجرانيت", "QYADA Marble & Granite Factory", "AED"),
        ("QYADA-STEEL", "قيادة لصناعة وتشكيل الحديد", "QYADA Steel Industries & Fabrication", "AED"),
        ("QYADA-LOGIST", "قيادة للنقليات والمعدات الثقيلة", "QYADA Logistics & Heavy Equipment", "AED")
    ]
    cursor.executemany("INSERT INTO companies (code, name_ar, name_en, currency) VALUES (?, ?, ?, ?);", companies_data)

    # Seed Branches
    branches_data = [
        (1, "HQ-AUH", "الفرع الرئيسي - أبوظبي", "Abu Dhabi Head Office", "Abu Dhabi"),
        (2, "BR-DXB", "فرع دبي - المقاولات", "Dubai Contracting Branch", "Dubai"),
        (2, "BR-SHJ", "فرع الشارقة - المقاولات", "Sharjah Contracting Branch", "Sharjah"),
        (3, "FAC-ICAD", "مصنع الرخام - أيكاد أبوظبي", "Marble Factory - ICAD Abu Dhabi", "Abu Dhabi"),
        (4, "FAC-DIC", "مصنع الحديد - دبي سيتي", "Steel Factory - Dubai Industrial City", "Dubai"),
        (5, "LOG-ALAIN", "مركز النقليات - العين", "Logistics Fleet Hub - Al Ain", "Abu Dhabi")
    ]
    cursor.executemany("INSERT INTO branches (company_id, code, name_ar, name_en, emirate) VALUES (?, ?, ?, ?, ?);", branches_data)

    # Seed Projects
    projects_data = [
        (2, "PRJ-DXB-001", "برج القيادة الأيقوني - دبي مارينا", "QYADA Iconic Tower - Dubai Marina", "In Progress", 68.5, 450000000.0, 280000000.0, 310000000.0, 520000000.0, 78000000.0, 290000000.0, "Medium", 5, "م. إبراهيم المنصوري", 25.0772, 55.1332, "2023-01-15", "2025-12-30"),
        (2, "PRJ-AUH-002", "مجمع الفلل الفاخرة - جزيرة ياس", "Luxury Villa Complex - Yas Island", "In Progress", 82.0, 280000000.0, 195000000.0, 210000000.0, 330000000.0, 55000000.0, 210000000.0, "Low", 0, "م. طارق العوضي", 24.4859, 54.6041, "2023-06-01", "2025-08-15"),
        (3, "PRJ-SHJ-003", "المركز التجاري الدولي - الشارقة", "International Commercial Mall - Sharjah", "In Progress", 41.2, 320000000.0, 145000000.0, 170000000.0, 370000000.0, -1500000.0, 120000000.0, "High", 18, "م. خالد القاسمي", 25.3463, 55.4209, "2023-09-10", "2026-03-20"),
        (2, "PRJ-AUH-004", "مستشفى القيادة التخصصي - أبوظبي", "QYADA Specialty Hospital - Abu Dhabi", "In Progress", 91.0, 190000000.0, 162000000.0, 168000000.0, 220000000.0, 28000000.0, 180000000.0, "Low", 0, "م. سارة المرزوقي", 24.4539, 54.3773, "2022-11-01", "2025-05-30")
    ]
    cursor.executemany("""
    INSERT INTO projects (branch_id, code, name_ar, name_en, status, progress, budget_aed, actual_cost_aed, committed_cost_aed, revenue_aed, profit_aed, cash_collected_aed, risk_level, delay_days, manager_name, latitude, longitude, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, projects_data)

    # Seed BOQs
    boq_data = [
        (1, "BOQ-CONC-01", "أعمال الخرسانة المسلحة للأبراج", "Reinforced Concrete Works for Towers", "m3", 45000, 1200, 54000000, 31000),
        (1, "BOQ-MARB-02", "توريد وتركيب رخام إيطالي فاخر للمداخل", "Supply & Installation of Italian Marble", "m2", 18000, 850, 15300000, 12500),
        (1, "BOQ-STEL-03", "الهياكل الحديدية والإنشاءات المعدنية", "Structural Steel Fabrication & Erection", "Ton", 3200, 7500, 24000000, 2100),
        (2, "BOQ-VIL-01", "تشطيبات فاخرة وأعمال ديكور رخام", "Luxury Finishes & Marble Decor", "m2", 22000, 650, 14300000, 18000)
    ]
    cursor.executemany("""
    INSERT INTO boq_items (project_id, item_code, description_ar, description_en, unit, quantity, unit_rate_aed, total_amount_aed, executed_qty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, boq_data)

    # Seed Invoices (with 5% UAE VAT)
    invoices_data = [
        (2, 1, "INV-2025-001", "Receivable", "شركة إعمار العقارية", 12000000.0, 600000.0, 12600000.0, "Paid", "2025-02-15", "2025-01-15"),
        (2, 1, "INV-2025-002", "Receivable", "شركة إعمار العقارية", 15000000.0, 750000.0, 15750000.0, "Unpaid", "2025-03-30", "2025-02-28"),
        (2, 2, "INV-2025-003", "Receivable", "شركة الدار العقارية", 8500000.0, 425000.0, 8925000.0, "Paid", "2025-02-20", "2025-01-20"),
        (3, 1, "INV-2025-004", "Payable", "شركة حديد الإمارات (Emirates Steel)", 4200000.0, 210000.0, 4410000.0, "Pending Approval", "2025-03-15", "2025-02-10")
    ]
    cursor.executemany("""
    INSERT INTO invoices (company_id, project_id, invoice_no, type, entity_name, subtotal_aed, vat_amount_aed, total_aed, status, due_date, issue_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, invoices_data)

    # Seed Manufacturing Lines
    mfg_lines = [
        ("Marble", "MARB-LINE-1", "خط قص الجرانيت والرخام الإيطالي Waterjet", "Waterjet Italian Marble Cutting Line", "1200 m2/Day", 92.5, "Operational"),
        ("Marble", "MARB-LINE-2", "خط جلي وتلميع الألواح الملكية", "Royal Slab Polishing & Buffing Line", "850 m2/Day", 88.0, "Operational"),
        ("Steel", "STEEL-LINE-1", "خط تصنيع الهياكل الثقيلة والجسور", "Heavy Structural Steel Fabrication Line", "150 Tons/Day", 95.0, "Operational"),
        ("Steel", "STEEL-LINE-2", "خط قص وثني الحديد للجسور والأعمدة", "CNC Steel Rebar Cutting & Bending Line", "220 Tons/Day", 84.0, "Operational")
    ]
    cursor.executemany("""
    INSERT INTO manufacturing_lines (factory_type, line_code, name_ar, name_en, daily_capacity, utilization_pct, status)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, mfg_lines)

    # Seed Production Batches
    batches_data = [
        ("Marble", "BATCH-MARB-881", 1, 1, "رخام كالاكاتا فاخر للواجهات", "Calacatta Gold Marble Slabs", 4500, "m2", 85.0, "In Production", "2025-03-10"),
        ("Marble", "BATCH-MARB-882", 2, 2, "رخام كرارا إيطالي للفلل", "Carrara White Marble Tiles", 3200, "m2", 100.0, "Completed", "2025-02-25"),
        ("Steel", "BATCH-STEL-401", 3, 1, "جسور معدنية H-Beams لبرج دبي", "Heavy Duty Steel H-Beams", 650, "Ton", 70.0, "In Production", "2025-03-20")
    ]
    cursor.executemany("""
    INSERT INTO production_batches (factory_type, batch_no, line_id, project_id, product_name_ar, product_name_en, quantity, unit, completion_pct, status, delivery_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, batches_data)

    # Seed Fleet Vehicles
    fleet_data = [
        ("FLEET-TRK-01", "AD-58921", "شاحنة نقل ثقيل Mercedes Actros", "Heavy Trailer Truck - Actros", 1, "عثمان الفارسي", "Active", "28L / 100km", 25.0800, 55.1400),
        ("FLEET-CRN-02", "DXB-10492", "رافعات برجية Liebherr 550 Ton", "Heavy Crane Liebherr 550T", 1, "راجيش كومار", "Active", "15L / Hr", 25.0772, 55.1332),
        ("FLEET-MXR-03", "SHJ-30291", "خلاطة خرسانة سعة 12 متر مكعب", "Concrete Mixer 12m3", 3, "محمد علي العوضي", "Active", "32L / 100km", 25.3463, 55.4209),
        ("FLEET-EXC-04", "AD-99201", "حفارة ثقيلة CAT 349", "Heavy Excavator CAT 349", 2, "أحمد سالم", "Maintenance", "22L / Hr", 24.4859, 54.6041)
    ]
    cursor.executemany("""
    INSERT INTO fleet_vehicles (vehicle_code, plate_no, type_ar, type_en, assigned_project_id, driver_name, status, fuel_efficiency, gps_lat, gps_lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, fleet_data)

    # Seed Employees (WPS Compliant)
    employees_data = [
        (1, "EMP-001", "د. سلطان القاسمي", "Dr. Sultan Al Qasimi", "Executive", "Chief Executive Officer (CEO)", 85000, 35000, 120000, "Compliant", "784-1980-1234567-1"),
        (2, "EMP-002", "م. إبراهيم المنصوري", "Eng. Ibrahim Al Mansoori", "Projects", "Senior Project Director", 35000, 15000, 50000, "Compliant", "784-1985-7654321-2"),
        (2, "EMP-003", "أحمد الشامسي", "Ahmed Al Shamsi", "Finance", "Chief Financial Officer (CFO)", 40000, 18000, 58000, "Compliant", "784-1982-9988776-3"),
        (3, "EMP-004", "م. جيوفاني روسي", "Eng. Giovanni Rossi", "Factory", "Marble Factory Director", 30000, 12000, 42000, "Compliant", "784-1978-1122334-4")
    ]
    cursor.executemany("""
    INSERT INTO employees (company_id, emp_code, name_ar, name_en, department, designation, basic_salary_aed, allowances_aed, total_salary_aed, wps_status, emirates_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, employees_data)

    # Seed Workflows
    workflows_data = [
        ("WF-2025-101", "طلب شراء رخام كالاكاتا لمشروع برج دبي", "Calacatta Marble Procurement Approval", "م. إبراهيم المنصوري", "المشتريات", 2450000.0, "High", "Pending", datetime.now().strftime("%Y-%m-%d %H:%M")),
        ("WF-2025-102", "اعتماد شهادة الدفع رقم 6 لمقاول الباطن", "Payment Certificate #6 Approval", "أحمد الشامسي", "المالية", 1850000.0, "High", "Pending", (datetime.now() - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M")),
        ("WF-2025-103", "طلب صيانة دورية للرافعات البرجية", "Tower Crane Maintenance Request", "م. طارق العوضي", "المعدات", 120000.0, "Medium", "Approved", (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M"))
    ]
    cursor.executemany("""
    INSERT INTO workflows (workflow_code, title_ar, title_en, requester, department, amount_aed, priority, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, workflows_data)

    # Seed Audit Logs
    audit_data = [
        ("الرئيس التنفيذي", "اعتماد ميزانية مشروع جزيرة ياس", "Approved Yas Island Project Budget", "المالية والمشاريع", (datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"), "الميزانية المعتمدة: 280,000,000 درهم"),
        ("مدير النظام", "تحديث حالة خط إنتاج المصنع أيكاد", "Updated ICAD Factory Line Status", "المصانع", (datetime.now() - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M"), "تم رفع الكفاءة إلى 92.5%")
    ]
    cursor.executemany("""
    INSERT INTO audit_logs (user_name, action_ar, action_en, module, timestamp, details)
    VALUES (?, ?, ?, ?, ?, ?);
    """, audit_data)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    seed_data()
    print("QYADA ERP Database initialized and pre-populated successfully!")
