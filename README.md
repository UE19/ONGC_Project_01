# Centralized AI-Powered Database Query Intelligence Platform

## Overview

This repository implements a centralized AI-powered Database Query Intelligence Platform. The platform enables secure connections to multiple enterprise databases, provides natural language query support through intelligent digital assistants, and exposes these capabilities to external applications using secure APIs.

The core focus is:
- Centralized backend intelligence layer
- Secure database connection profiles
- API token management for specific databases
- Support for multiple database technologies
- Unified AI-assisted query interface
- Security, isolation, auditability, and scalability
- Containerized deployment

## Key Features

- Configure and manage database connection profiles
- Generate scoped API tokens for database access
- Securely expose query capabilities to external applications and assistants
- Natural language query support via Vanna AI
- Support for multiple database technologies
- Centralized intelligence and query orchestration
- Audit logging and access isolation
- Container-ready architecture

## Repository Layout

- `vanna-platform/`
    - Main source codebase for the platform
    - Backend services, AI integration, database connectors, API layers
- Root directory
    - Test files
    - Test result files

## Getting Started

1. Clone the repository
2. Explore `vanna-platform/` for source code
3. Review root-level test files for validation and expected outputs
4. Configure database profiles and authentication secrets
5. Deploy using container orchestration for scalability and isolation

## Deployment

- Designed for containerized deployment
- Ideal for Docker and Kubernetes environments
- Ensures environment consistency and secure service isolation

## Notes

- The platform is intended as a centralized backend layer also as a standalone end-user application
- External applications and assistants connect through secure APIs and generated tokens
- AI query assistance is powered by Vanna AI for natural language database querying
