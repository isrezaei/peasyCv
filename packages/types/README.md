# @resume/types

Shared TypeScript contract types for the resume builder, consumed by the
NestJS backend.

> **Source of truth:** `frontend/src/types`. This package **mirrors** that model
> 1:1 so the backend's Prisma serialization and DTOs round-trip to the exact
> `ResumeData` shape the frontend store and SWR hooks consume. When the frontend
> types change, mirror the change here. The backend's round-trip test
> (`backend/test`) guards against drift.
