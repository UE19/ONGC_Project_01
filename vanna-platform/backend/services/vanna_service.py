"""
Vanna AI Service client.
Communicates with the standalone vanna-service container via HTTP.
"""
import httpx
from typing import Optional

from core.config import settings


class VannaServiceClient:
    """HTTP client wrapping the Vanna AI microservice."""

    def __init__(self):
        self.base_url = settings.VANNA_SERVICE_URL
        self.timeout = 30.0

    async def generate_sql(
        self,
        profile_id: str,
        db_type: str,
        question: str,
        schema_context: dict,
    ) -> dict:
        """
        Returns the generated SQL Query, its explanation and confidence.
        POST /generate-sql
        Returns: {sql, explanation, confidence}
        Gets data from vanna-service.
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/generate-sql",
                json={
                    "profile_id": profile_id,
                    "db_type": db_type,
                    "question": question,
                    "schema_context": schema_context,
                },
            )
            resp.raise_for_status()
            return resp.json()

    async def explain_sql(self, sql: str, db_type: str) -> str:
        """Return a human-readable explanation of the SQL."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/explain-sql",
                json={"sql": sql, "db_type": db_type},
            )
            resp.raise_for_status()
            return resp.json().get("explanation", "")

    async def summarize_results(self, question: str, data: list, row_count: int) -> str:
        """Generate a natural language summary of the query results."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/summarize",
                json={
                    "question": question,
                    "data": data[:10],  # send first 10 rows for summarization
                    "row_count": row_count,
                },
            )
            resp.raise_for_status()
            return resp.json().get("summary", f"Query returned {row_count} row(s).")

    async def train_schema(self, profile_id: str, db_type: str, schema_metadata: dict) -> dict:
        """
        POST /train
        Train the Vanna model on a new schema.
        """
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/train",
                json={
                    "profile_id": profile_id,
                    "db_type": db_type,
                    "schema_metadata": schema_metadata,
                },
            )
            resp.raise_for_status()
            return resp.json()

    async def health_check(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/health")
                return resp.status_code == 200
        except Exception:
            return False


vanna_client = VannaServiceClient()
