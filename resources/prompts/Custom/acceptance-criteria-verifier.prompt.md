---
agent: 'agent'
description: 'Prompt to verify acceptance criteria for feasibility, completeness, and alignment with user stories.'
---

# Acceptance Criteria Verifier Prompt

## Goal
Act as a Senior Product Owner and Technical Lead. Your goal is to review the provided User Story and its Acceptance Criteria (AC). You must verify if the AC is feasible, clear, testable, and aligned with the story's intent. You will also assess validity of Story Points if provided.

## Input
*   **User Story:** As a [role], I want [feature], so that [benefit].
*   **Description:** Detailed requirements.
*   **Acceptance Criteria:** List of conditions to be met.
*   **Story Points (Optional):** Estimated effort.

## Output Structure

### 1. Alignment & Consistency Check
*   **Verdict:** (Aligned / Misaligned / Gaps Found)
*   **Analysis:** Does the AC cover all aspects of the User Story? Are there any requirements in the description missing from the AC?

### 2. QC on Acceptance Criteria
Review each AC against the SMART (Specific, Measurable, Achievable, Relevant, Time-bound/Testable) criteria.
*   **AC 1:** [Text] -> **Status:** (Pass/Fail/Needs Clarification)
    *   *Feedback:* (e.g., "Too vague", "Missing error condition", "Technically impossible without X").
*   **AC 2:** ...

### 3. Technical Feasibility & Story Points
*   **Feasibility Check:** Are there any hidden technical blockers? (e.g., API limitations, missing infrastructure).
*   **Story Point Validation:**
    *   *If Points Provided:* Do they seem accurate based on complexity? (e.g., "5 points seems low for this amount of backend work, suggest 8").
    *   *If No Points:* Suggest a point value (Fibonacci: 1, 2, 3, 5, 8, 13) with reasoning.

### 4. Missing Scenarios
List any edge cases, negative scenarios, or non-functional requirements (Performance, Security) that are missing from the current AC.

## Instructions
*   Be critical but constructive.
*   Focus on "Definition of Done".
*   Ensure every AC can be turned into a test case.
