 import argparse
import os
import sys
from typing import Optional

import httpx

DEFAULT_BASE_URL = "http://localhost"


def prompt_if_missing(name: str, description: str, default: Optional[str] = None, secret: bool = False) -> str:
    value = os.getenv(name) or default
    if value:
        return value
    prompt = f"{description}"
    if default:
        prompt += f" [{default}]"
    prompt += ": "
    return input(prompt).strip()


def safe_print_response(response: httpx.Response, label: str) -> None:
    print("\n--- {} ---".format(label))
    print(f"URL: {response.url}")
    print(f"Status: {response.status_code} {response.reason_phrase}")
    try:
        print(response.json())
    except Exception:
        print(response.text)


def login(client: httpx.Client, email: str, password: str) -> str:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    response.raise_for_status()
    data = response.json()
    access_token = data.get("access_token")
    if not access_token:
        raise RuntimeError("Login response did not include access_token")
    return access_token


def choose_profile_id(client: httpx.Client, auth_headers: dict, profile_id: Optional[str]) -> str:
    if profile_id:
        return profile_id
    response = client.get("/api/v1/profiles", headers=auth_headers)
    response.raise_for_status()
    profiles = response.json()
    if not profiles:
        raise RuntimeError(
            "No profiles found for this user. Set VANNA_PROFILE_ID or create a profile in the app before proceeding."
        )
    chosen_id = profiles[0].get("id")
    print(f"Using first available profile_id from /api/v1/profiles: {chosen_id}")
    return chosen_id


def create_token(client: httpx.Client, auth_headers: dict, profile_id: str) -> dict:
    payload = {
        "name": "test_api_token",
        "description": "Automated test token created by test_api_token_flow.py",
        "profile_id": profile_id,
        "permissions": ["query"],
        "allowed_schemas": [],
        "allowed_tables": [],
        "expires_at": None,
        "rate_limit_per_minute": 60,
    }
    response = client.post("/api/v1/tokens", headers=auth_headers, json=payload)
    response.raise_for_status()
    return response.json()


def validate_token(client: httpx.Client, raw_token: str) -> httpx.Response:
    api_headers = {"Authorization": f"Bearer {raw_token}"}
    return client.get("/api/v1/tokens/validate", headers=api_headers)


def get_token(client: httpx.Client, auth_headers: dict, token_id: str) -> httpx.Response:
    return client.get(f"/api/v1/tokens/{token_id}", headers=auth_headers)


def execute_query(client: httpx.Client, raw_token: str, question: str) -> httpx.Response:
    api_headers = {"Authorization": f"Bearer {raw_token}"}
    payload = {"question": question, "page": 1, "page_size": 10, "explain": False}
    return client.post("/api/query", headers=api_headers, json=payload)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Test Vanna token create, validate, get token, and execute query endpoints."
    )
    parser.add_argument("--base-url", default=os.getenv("VANNA_BASE_URL", DEFAULT_BASE_URL), help="Base URL for the Vanna backend API")
    parser.add_argument("--email", default=os.getenv("VANNA_ADMIN_EMAIL"), help="Login email for an existing Vanna user")
    parser.add_argument("--password", default=os.getenv("VANNA_ADMIN_PASSWORD"), help="Login password for the Vanna user")
    parser.add_argument("--profile-id", default=os.getenv("VANNA_PROFILE_ID"), help="Connection profile UUID to attach the API token to")
    parser.add_argument(
        "--question",
        default=os.getenv("VANNA_QUERY", "Show the first 5 rows from an available table."),
        help="Natural language query text for /api/query",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    email = args.email or prompt_if_missing("VANNA_ADMIN_EMAIL", "Admin/user email")
    password = args.password or prompt_if_missing("VANNA_ADMIN_PASSWORD", "Admin/user password")
    profile_id = args.profile_id
    question = args.question

    with httpx.Client(base_url=args.base_url, timeout=30.0) as client:
        try:
            print("Logging in...")
            access_token = login(client, email, password)
            auth_headers = {"Authorization": f"Bearer {access_token}"}
            print("Login successful.")

            selected_profile_id = choose_profile_id(client, auth_headers, profile_id)
            print(f"Profile ID used for token creation: {selected_profile_id}")

            print("Creating API token...")
            token_data = create_token(client, auth_headers, selected_profile_id)
            print("\n--- API token created ---")
            print(token_data)

            raw_token = token_data.get("raw_token")
            token_id = token_data.get("id")
            if not raw_token or not token_id:
                raise RuntimeError("Token creation response did not contain raw_token or id.")

            print(f"Token ID: {token_id}")
            print("Validating API token...")
            validation_response = validate_token(client, raw_token)
            safe_print_response(validation_response, "Token validation")

            print("Fetching token details with access token...")
            token_response = get_token(client, auth_headers, token_id)
            safe_print_response(token_response, "Get token details")

            print("Executing query using API token...")
            query_response = execute_query(client, raw_token, question)
            safe_print_response(query_response, "Execute query")

            print("Test script completed.")
            return 0

        except httpx.HTTPStatusError as exc:
            print(f"HTTP error during request: {exc.response.status_code} {exc.response.reason_phrase}")
            try:
                print(exc.response.json())
            except Exception:
                print(exc.response.text)
            return 1
        except Exception as exc:
            print(f"Error: {exc}")
            return 1


main()
