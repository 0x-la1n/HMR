"""
Maintenance routes: CRUD for maintenance logs, stats, predictions, and alerts.
Handles both battery and mechanical maintenance tracking for hotel room locks.
"""
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from db import get_connection, release_connection
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])


# ── Pydantic Models ──────────────────────────────────────────────────────────

class MaintenanceCreate(BaseModel):
    room_id: int
    part_type_id: Optional[int] = None
    type: str  # 'battery' | 'mechanical'
    description: Optional[str] = None
    performed_at: Optional[str] = None  # ISO date string


# ── List maintenance logs ────────────────────────────────────────────────────

@router.get("")
async def list_maintenance(
    room_id: Optional[int] = None,
    module_id: Optional[int] = None,
    type: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """List maintenance logs with optional filters, newest first."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        query = """
            SELECT ml.id, ml.room_id, ml.part_type_id, ml.type, ml.description,
                   ml.performed_by, ml.performed_at, ml.created_at,
                   r.room_number,
                   f.code AS floor_code,
                   m.number AS module_number, m.name AS module_name,
                   pt.name AS part_name,
                   u.full_name AS user_name
            FROM maintenance_logs ml
            JOIN rooms r ON ml.room_id = r.id
            JOIN floors f ON r.floor_id = f.id
            JOIN modules m ON f.module_id = m.id
            LEFT JOIN part_types pt ON ml.part_type_id = pt.id
            LEFT JOIN users u ON ml.performed_by = u.id
            WHERE 1=1
        """
        params = []

        if room_id:
            query += " AND ml.room_id = %s"
            params.append(room_id)
        if module_id:
            query += " AND m.id = %s"
            params.append(module_id)
        if type:
            query += " AND ml.type = %s"
            params.append(type)

        query += " ORDER BY ml.performed_at DESC, ml.created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        cur.execute(query, params)
        rows = cur.fetchall()

        logs = [
            {
                "id": r[0], "room_id": r[1], "part_type_id": r[2], "type": r[3],
                "description": r[4], "performed_by": r[5],
                "performed_at": r[6].isoformat() if r[6] else None,
                "created_at": r[7].isoformat() if r[7] else None,
                "room_number": r[8], "floor_code": r[9],
                "module_number": r[10], "module_name": r[11],
                "part_name": r[12], "user_name": r[13],
            }
            for r in rows
        ]
        return {"success": True, "logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        release_connection(conn)


# ── Create maintenance log ───────────────────────────────────────────────────

@router.post("")
async def create_maintenance(
    data: MaintenanceCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a maintenance log entry. If type=battery, also updates rooms.last_battery_change."""
    conn = get_connection()
    try:
        cur = conn.cursor()

        perf_date = data.performed_at or date.today().isoformat()

        cur.execute("""
            INSERT INTO maintenance_logs (room_id, part_type_id, type, description, performed_by, performed_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.room_id, data.part_type_id, data.type,
            data.description, current_user["id"], perf_date,
        ))
        log_id = cur.fetchone()[0]

        # Update room's last_battery_change if this is a battery change
        if data.type == "battery":
            cur.execute(
                "UPDATE rooms SET last_battery_change = %s WHERE id = %s",
                (perf_date, data.room_id),
            )

        conn.commit()
        return {"success": True, "id": log_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        release_connection(conn)


# ── Delete a maintenance log ─────────────────────────────────────────────────

@router.delete("/{log_id}")
async def delete_maintenance(log_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM maintenance_logs WHERE id = %s", (log_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        release_connection(conn)


# ── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def maintenance_stats(current_user: dict = Depends(get_current_user)):
    """Summary stats for the maintenance dashboard."""
    conn = get_connection()
    try:
        cur = conn.cursor()

        # Total logs
        cur.execute("SELECT COUNT(*) FROM maintenance_logs")
        total = cur.fetchone()[0]

        # This month
        cur.execute("""
            SELECT COUNT(*) FROM maintenance_logs
            WHERE DATE_TRUNC('month', performed_at) = DATE_TRUNC('month', CURRENT_DATE)
        """)
        this_month = cur.fetchone()[0]

        # By type
        cur.execute("""
            SELECT type, COUNT(*) FROM maintenance_logs GROUP BY type
        """)
        by_type = {r[0]: r[1] for r in cur.fetchall()}

        # By module (for chart)
        cur.execute("""
            SELECT m.name, COUNT(ml.id)
            FROM maintenance_logs ml
            JOIN rooms r ON ml.room_id = r.id
            JOIN floors f ON r.floor_id = f.id
            JOIN modules m ON f.module_id = m.id
            GROUP BY m.name, m.sort_order
            ORDER BY m.sort_order
        """)
        by_module = [{"module": r[0], "count": r[1]} for r in cur.fetchall()]

        return {
            "success": True,
            "stats": {
                "total": total,
                "this_month": this_month,
                "battery_changes": by_type.get("battery", 0),
                "mechanical_repairs": by_type.get("mechanical", 0),
                "by_module": by_module,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        release_connection(conn)


# ── Part types ───────────────────────────────────────────────────────────────

@router.get("/part-types")
async def list_part_types(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, category FROM part_types ORDER BY category, name")
        parts = [{"id": r[0], "name": r[1], "category": r[2]} for r in cur.fetchall()]
        return {"success": True, "part_types": parts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        release_connection(conn)


# ── Predictions ──────────────────────────────────────────────────────────────

@router.get("/predictions")
async def get_predictions(
    module_id: Optional[int] = None,
    current_user: dict = Depends(get_current_user),
):
    """
    For each room, calculate battery prediction based on the average interval
    between the last 3 battery changes.
    Returns: room info, last change, avg days, estimated next change, health score.
    """
    conn = get_connection()
    try:
        cur = conn.cursor()

        # Get rooms with at least 1 battery log
        room_filter = ""
        params = []
        if module_id:
            room_filter = "AND m.id = %s"
            params.append(module_id)

        cur.execute(f"""
            SELECT r.id, r.room_number, r.last_battery_change,
                   f.code AS floor_code, m.number AS module_number, m.name AS module_name
            FROM rooms r
            JOIN floors f ON r.floor_id = f.id
            JOIN modules m ON f.module_id = m.id
            WHERE r.status = 'active'
              AND r.last_battery_change IS NOT NULL
              {room_filter}
            ORDER BY m.sort_order, f.sort_order, r.room_number
        """, params)
        rooms = cur.fetchall()

        predictions = []
        today = date.today()

        for room in rooms:
            room_id = room[0]

            # Get last 4 battery changes to calculate 3 intervals
            cur.execute("""
                SELECT performed_at FROM maintenance_logs
                WHERE room_id = %s AND type = 'battery'
                ORDER BY performed_at DESC LIMIT 4
            """, (room_id,))
            dates = [r[0] for r in cur.fetchall()]

            if len(dates) < 2:
                # Not enough data for prediction, use default (90 days)
                avg_days = 90
            else:
                # Calculate intervals between consecutive changes
                intervals = []
                for i in range(len(dates) - 1):
                    delta = (dates[i] - dates[i + 1]).days
                    if delta > 0:
                        intervals.append(delta)
                avg_days = int(sum(intervals) / len(intervals)) if intervals else 90

            last_change = room[2]
            days_since = (today - last_change).days
            estimated_next = last_change + timedelta(days=avg_days)
            days_remaining = (estimated_next - today).days

            # Health score: 100 = just changed, 0 = overdue
            health = max(0, min(100, int(100 - (days_since / max(avg_days, 1)) * 100)))

            predictions.append({
                "room_id": room_id,
                "room_number": room[1],
                "floor_code": room[3],
                "module_number": room[4],
                "module_name": room[5],
                "last_battery_change": last_change.isoformat(),
                "avg_days_between_changes": avg_days,
                "estimated_next_change": estimated_next.isoformat(),
                "days_remaining": days_remaining,
                "health_score": health,
            })

        return {"success": True, "predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        release_connection(conn)


# ── Alerts (rooms at risk) ───────────────────────────────────────────────────

@router.get("/alerts")
async def get_alerts(
    threshold: int = Query(default=10, description="Days threshold for alerts"),
    current_user: dict = Depends(get_current_user),
):
    """Return rooms where the predicted next battery change is within `threshold` days."""
    result = await get_predictions(current_user=current_user)
    alerts = [
        p for p in result["predictions"]
        if p["days_remaining"] <= threshold
    ]
    # Sort by urgency (most urgent first)
    alerts.sort(key=lambda x: x["days_remaining"])

    return {
        "success": True,
        "threshold": threshold,
        "alerts": alerts,
        "count": len(alerts),
    }
