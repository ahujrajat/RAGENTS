---
agent: 'agent'
description: 'Prompt to generate comprehensive SQL database schemas from high-level requirements or documentation.'
---

# SQL Schema Generator Prompt

## Goal
Act as a Senior Database Architect. Your task is to design and generate a normalized, efficient SQL database schema based on the provided requirements (User input, BRD, or PRD).

## Input
Requirements text, User Story, Business Requirement Document (BRD), or Product Requirement Document (PRD).

## Output Structure

### 1. Conceptual Data Model
*   **Entities:** List primary entities (tables).
*   **Relationships:** Describe how they interact (One-to-One, One-to-Many, Many-to-Many).

### 2. Logical Data Model
For each table, define:
*   **Table Name:** (Use standard naming conventions, e.g., `snake_case`).
*   **Columns:** Name, Data Type, Nullability.
*   **Keys:** Primary Key (PK), Foreign Keys (FK).

### 3. Physical Data Model (SQL Script)
Provide the actual SQL `CREATE TABLE` statements.
*   Ensure correct data types (INTEGER, VARCHAR, TIMESTAMP, BOOLEAN, etc.).
*   Define constraints (NOT NULL, UNIQUE, CHECK).
*   Define Foreign Key constraints with `ON DELETE` / `ON UPDATE` actions.
*   Add comments/descriptions for complex columns if the dialect supports it.

```sql
-- Example
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Optimization & Integrity
*   **Indexes:** Suggest indexes for performance (e.g., on FK columns, frequently searched fields).
*   **Default Values:** Reasonable defaults.
*   **Assumptions:** Any assumptions made about data types or relationships.

## Instructions
*   Target clear, 3rd Normal Form (3NF) design unless denormalization is requested for performance.
*   Use standard ANSI SQL unless a specific dialect (PostgreSQL, MySQL, T-SQL) is requested.
*   Include `DROP TABLE IF EXISTS` for reproducibility (optional).
