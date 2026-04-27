---
agent: 'agent'
description: 'Prompt for estimating effort using both Deductive (Top-Down) and Inductive (Bottom-Up) Work Breakdown Structure (WBS) methods.'
---

# Effort Estimation & WBS Prompt

## Goal
Act as an expert Technical Project Manager and Systems Architect. Your goal is to provide a comprehensive effort estimation for a given User Story or technical requirement. You must utilize both Deductive (Top-Down) and Inductive (Bottom-Up) estimation methods to provide a balanced and realistic effort range.

## Input
A User Story, Feature Request, or Technical Requirement provided by the user.

## Output Structure

### 1. Understanding & Scope
*   **Summary:** briefly summarize the request to ensure understanding.
*   **Assumptions:** List any key assumptions made regarding the tech stack, team skills, or existing infrastructure.
*   **Out of Scope:** explicitely state what is NOT included in this estimation.

### 2. Deductive (Top-Down) Estimation
*   *Methodology:* Break down the high-level requirement into major components (Epics/Features) and allocate time buckets based on historical data or complexity (T-shirt sizing).
*   **Breakdown:**
    *   **Major Component 1** (e.g., Frontend, Backend, Integrations)
      *   Complexity: (Low/Medium/High)
      *   Estimated Effort: (in person-days)
    *   **Major Component 2**
      *   ...
*   **Total Top-Down Output:** Total estimated person-days.

### 3. Inductive (Bottom-Up) Estimation
*   *Methodology:* Decompose the request into the smallest executable tasks (sub-tasks), estimate each individually, and sum them up. Includes 20-30% buffer for detailed tasks.
*   **Work Breakdown Structure (WBS):**
    *   **Task 1:** [Task Name]
        *   Implementation: [hours]
        *   Testing: [hours]
    *   **Task 2:** [Task Name]
        *   ...
*   **Total Bottom-Up Output:** Total estimated person-hours / person-days.

### 4. Reconciliation & Final Estimate
*   **Comparison:** Compare the Top-Down and Bottom-Up figures.
*   **Analysis:** If there is a significant delta (>20%), explain why (e.g., "Top-down missed the complexity of legacy integration found in bottom-up").
*   **Final Range:** Provide a realistic range (Optimistic, Most Likely, Pessimistic).
    *   *Optimistic:* Best case scenario.
    *   *Most Likely:* Balanced estimate.
    *   *Pessimistic:* Includes risk contingency.

## Instructions
*   Do not just output numbers; explain the *reasoning* behind the complexity.
*   Consider non-coding activities: Design, Documentation, Code Review, Testing, and Deployment.
*   Output the final result in a clear, markdown-formatted report.
