"""
Export Service — generates CSV and Excel downloads from query results.
"""
import io
from typing import Any, Dict, List

import pandas as pd


def to_csv(data: List[Dict[str, Any]], columns: List[str]) -> bytes:
    """Convert query results to CSV bytes."""
    df = pd.DataFrame(data, columns=columns)
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    return buf.getvalue().encode("utf-8")


def to_excel(data: List[Dict[str, Any]], columns: List[str], sheet_name: str = "Query Results") -> bytes:
    """Convert query results to Excel (.xlsx) bytes."""
    df = pd.DataFrame(data, columns=columns)
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name=sheet_name)
        # Auto-size columns
        ws = writer.sheets[sheet_name]
        for col in ws.columns:
            max_len = max((len(str(cell.value)) for cell in col if cell.value), default=10)
            ws.column_dimensions[col[0].column_letter].width = min(max_len + 2, 50)
    return buf.getvalue()
