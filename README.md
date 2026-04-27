# RAGENTS

**Library of Agents, Prompts, Instructions and Skills for VS Code / Copilot / Claude Code.**

RAGENTS provides a convenient Sidebar view in VS Code to browse, preview, and download community-curated and custom AI prompts and agent definitions. It is designed to work seamlessly with GitHub Copilot and Claude Code workflows.

## Features

-   **Activity Bar Icon**: Dedicated access to your RAGENTS library.
-   **Categorized View**: Browse `Agents`, `Instructions`, `Prompts`, and `Skills`.
-   **Public & Custom**: Distinct separation between community assets (Public) and verified internal assets (Custom).
-   **Smart Security**: Automatically injects a "Use with Caution" warning when using Public assets.
-   **One-Click Download**: Instantly copy assets to your workspace's `.github/` or `.claude/` folder.
-   **Multi-Platform**: Supports both GitHub Copilot and Claude Code with automatic directory mapping.

## How to Use

1.  Click the **RAGENTS** icon in the VS Code Activity Bar.
2.  Expand the categories to find the asset you need.
3.  **Click** an item to preview its content.
4.  **Right-Click** and select **Download** to add it to your current project.

---

## Platform Support

RAGENTS supports downloading assets for both **GitHub Copilot** and **Claude Code**. Configure the target platform via the `ragents.targetPlatform` setting:

| Setting Value | Behavior |
|---------------|----------|
| `ask` (default) | Prompts you to choose each time you download |
| `copilot` | Always saves to `.github/` |
| `claudeCode` | Always saves to `.claude/` |

### Directory Mapping

| Category     | Copilot (`.github/`)                         | Claude Code (`.claude/`)                   |
|--------------|----------------------------------------------|--------------------------------------------|
| Agents       | `.github/agents/foo.agent.md`                | `.claude/agents/foo.md`                    |
| Prompts      | `.github/prompts/foo.prompt.md`              | `.claude/commands/foo.md` (slash commands) |
| Instructions | `.github/instructions/foo.instructions.md`   | `CLAUDE.md` (append) or `.claude/foo.md`   |
| Skills       | `.github/skills/foo/SKILL.md`                | `.claude/commands/foo.md` (flattened)      |

**Notes:**
- For Claude Code, **instructions** can be appended directly to your project's `CLAUDE.md` file or saved as separate files in `.claude/`.
- **Skills** are flattened into single `.md` files and become slash commands in Claude Code.
- **Prompts** become slash commands in Claude Code (e.g., `/foo` from `.claude/commands/foo.md`).

---

## Asset Catalog

### Agents

AI agents are specialized assistants with defined personas and capabilities.

#### Custom Agents

| Agent | Description |
|-------|-------------|
| `analyse_epic` | Breaks down epics into structured analysis for sprint planning. |
| `BQ-Schema-Medallion-Semantic-Mapping` | Maps database schemas through Bronze → Silver → Gold medallion layers with BigQuery-native semantics and business-friendly definitions. |
| `bta_architecture_creator` | Generates technical architecture documents from business requirements. |
| `bta_brd_creator` | Creates Business Requirements Documents (BRD) from stakeholder input. |
| `bta_epic_creator` | Transforms requirements into well-structured Agile epics. |
| `bta_prd_creator` | Produces Product Requirements Documents (PRD) from feature ideas. |
| `code-quality-reviewer` | Reviews code for quality, maintainability, and best practices. |
| `data-foundation-readiness-assessment` | Assesses organizational data foundation maturity across 6 domains and 33 vectors, maps to a Data Backbone target state, identifies 42 areas of opportunity, and recommends prioritized Agentic/Gen AI interventions. |
| `generate_code` | Generates code based on specifications and requirements. |
| `generate_code_prompt` | Creates prompts for code generation tasks. |
| `generate_func_test_case` | Produces functional test cases from requirements. |
| `generate_integration_test_case` | Creates integration test scenarios. |
| `generate_perf_test_case` | Designs performance testing strategies. |
| `generate_unit_test_case` | Generates unit tests for code coverage. |
| `get_data_model_subagents_type` | Identifies data model sub-agent classifications. |
| `get_utility_agent_type` | Determines utility agent type classifications. |
| `presentation-creator` | Generates stunning, production-ready HTML/CSS/JS slide-deck presentations from context provided via files, PPTs, code, markdown, images, or verbal instructions. |
| `redshift-to-glue-converter` | Converts legacy Redshift stored procedures (PL/pgSQL) into modern, enterprise-grade AWS Glue PySpark ETL jobs with high fidelity and optimized performance. |
| `sprint_executor` | Assists with sprint execution and task tracking. |
| `sprint_metrics` | Calculates and reports sprint velocity metrics. |
| `sprint_planner` | Helps plan sprints with capacity and priority analysis. |
| `story_analyzer` | Analyzes user stories for completeness and clarity. |
| `story_analyzer_and_validator` | Combined analysis and validation of user stories. |
| `story_augmenter` | Enhances user stories with acceptance criteria and details. |
| `story_validator` | Validates user stories against INVEST criteria. |
| `semantic-mapping` | Translates technical database column/table names into business-friendly terms using LLM reasoning and business glossaries. |
| `semantic-metadata-discovery` | Scans database schemas to extract table structures, relationships, and data profiles, classifying tables as Fact or Dimension. |
| `semantic-model-generation` | Generates production-ready semantic layer configuration files for dbt (MetricFlow), Cube, and Looker (LookML). |
| `validate_code` | Validates code against coding standards and patterns. |

#### Public Agents

| Agent | Description |
|-------|-------------|
| `4.1-Beast` | Enhanced reasoning agent with advanced problem-solving. |
| `Cloudarch` | Cloud architecture specialist for multi-cloud solutions. |
| `Thinking-Beast-Mode` | Deep thinking agent for complex analysis tasks. |
| `accessibility` | Web accessibility expert ensuring WCAG compliance. |
| `adr-generator` | Creates Architecture Decision Records (ADRs). |
| `aem-frontend-specialist` | Adobe Experience Manager frontend development expert. |
| `api-architect` | Designs RESTful and GraphQL API architectures. |
| `atlassian-requirements-to-jira` | Converts requirements into Jira tickets. |
| `azure-principal-architect` | Azure cloud architecture and governance specialist. |
| `azure-saas-architect` | SaaS architecture patterns on Azure. |
| `critical-thinking` | Applies critical analysis to problems and solutions. |
| `debug` | Assists with debugging and troubleshooting code. |
| `devils-advocate` | Challenges assumptions and identifies weaknesses. |
| `devops-expert` | CI/CD and DevOps best practices specialist. |
| `expert-nextjs-developer` | Next.js full-stack development expert. |
| `expert-react-frontend-engineer` | React frontend architecture specialist. |
| `github-actions-expert` | GitHub Actions workflow optimization. |
| `gitops-ci-specialist` | GitOps and continuous integration patterns. |
| `gpt-5-beast-mode` | Advanced GPT-5 reasoning capabilities. |
| `mentor` | Provides mentoring and learning guidance. |
| `microsoft-agent-framework-dotnet` | .NET agent framework development. |
| `microsoft-agent-framework-python` | Python agent framework development. |
| `microsoft-study-mode` | Microsoft certification study assistant. |
| `microsoft_learn_contributor` | Microsoft Learn content creation expert. |
| `modernization` | Application modernization strategies. |
| `mongodb-performance-advisor` | MongoDB performance tuning specialist. |
| `ms-sql-dba` | SQL Server database administration expert. |
| `openapi-to-application` | Generates applications from OpenAPI specs. |
| `plan-arch` | Solution and infrastructure architecture planning. |
| `planner` | Task and project planning assistant. |
| `postgresql-dba` | PostgreSQL database administration expert. |
| `power-bi-data-analysis-expert` | Power BI data analysis and visualization. |
| `power-bi-data-modeling-expert` | Power BI data modeling specialist. |
| `power-bi-dax-expert` | DAX formula and calculation expert. |
| `power-bi-performance-expert` | Power BI performance optimization. |
| `power-bi-visualization-expert` | Power BI visualization and dashboard design. |
| `power-platform-expert` | Microsoft Power Platform development specialist. |
| `prd-creator` | Product Requirements Document creation. |
| `principal-software-engineer` | Senior software engineering guidance and review. |
| `product-manager-advisor` | Product management strategy and decision support. |
| `prompt-builder` | AI prompt engineering and optimization. |
| `refine-issue` | Refines and improves GitHub issue descriptions. |
| `research-technical-spike` | Conducts technical spike research and analysis. |
| `responsible-ai-code` | Responsible AI coding practices and review. |
| `salesforce-expert` | Salesforce development and administration. |
| `search-ai-optimization-expert` | Search and AI optimization specialist. |
| `security-reviewer` | Security review and vulnerability analysis. |
| `software-engineer-agent-v1` | General-purpose software engineering agent. |
| `specification` | Technical specification document creation. |
| `system-architecture-reviewer` | Reviews system architecture for quality and patterns. |
| `tech-debt-remediation-plan` | Creates technical debt remediation plans. |
| `technical-content-evaluator` | Evaluates technical content for accuracy. |
| `technical-writer` | Technical documentation creation. |
| `ux-ui-designer` | UX/UI design patterns and review. |

---

### Instructions

Instructions provide coding guidelines and best practices for specific technologies.

#### Custom Instructions

| Instruction | Description |
|-------------|-------------|
| `redshift-glue-reference` | Reference for Redshift to Glue conversion patterns and mappings. |

#### Public Instructions

| Instruction | Description |
|-------------|-------------|
| `ai-prompt-engineering-safety-best-practices` | Comprehensive AI prompt engineering and safety guidelines. |
| `angular` | Angular development patterns and best practices. |
| `aspnet-rest-apis` | ASP.NET Core REST API development standards. |
| `azure-devops-pipelines` | Azure DevOps pipeline configuration guidelines. |
| `azure-functions-typescript` | TypeScript Azure Functions development. |
| `azure-logic-apps-power-automate` | Logic Apps and Power Automate patterns. |
| `azure-verified-modules-bicep` | Bicep modules following Azure Verified Modules standard. |
| `azure-verified-modules-terraform` | Terraform modules following AVM standard. |
| `bicep-code-best-practices` | Bicep infrastructure-as-code best practices. |
| `code-review-generic` | Generic code review checklist and guidelines. |
| `containerization-docker-best-practices` | Docker containerization standards. |
| `devops-core-principles` | Core DevOps principles and practices. |
| `dotnet-architecture-good-practices` | .NET architecture patterns and practices. |
| `dotnet-framework` | .NET Framework development guidelines. |
| `dotnet-upgrade` | .NET upgrade and migration strategies. |
| `dotnet-wpf` | WPF desktop application development. |
| `generate-modern-terraform-code-for-azure` | Modern Terraform patterns for Azure. |
| `langchain-python` | LangChain Python development patterns. |
| `localization` | Internationalization and localization guidelines. |
| `memory-bank` | Persistent memory patterns for AI agents. |
| `mongo-dba` | MongoDB administration best practices. |
| `ms-sql-dba` | SQL Server administration guidelines. |
| `nextjs-tailwind` | Next.js with Tailwind CSS development. |
| `nextjs` | Next.js application development patterns. |
| `performance-optimization` | General performance optimization techniques. |
| `power-apps-canvas-yaml` | Power Apps Canvas YAML development. |
| `power-apps-code-apps` | Power Apps code-first development. |
| `power-bi-custom-visuals-development` | Power BI custom visual development. |
| `power-bi-data-modeling-best-practices` | Power BI data modeling patterns. |
| `power-bi-dax-best-practices` | DAX formula best practices. |
| `power-bi-devops-alm-best-practices` | Power BI DevOps and ALM patterns. |
| `power-bi-report-design-best-practices` | Power BI report design guidelines. |
| `power-bi-security-rls-best-practices` | Power BI Row-Level Security patterns. |
| `power-platform-connector` | Custom connector development. |
| `power-platform-mcp-development` | Model Context Protocol development. |
| `python` | Python coding standards and patterns. |
| `r` | R programming best practices. |
| `reactjs` | React.js development patterns. |

---

### Prompts

Prompts are reusable templates for common AI-assisted tasks.

#### Custom Prompts

| Prompt | Description |
|--------|-------------|
| `acceptance-criteria-verifier` | Validates acceptance criteria for completeness and testability. |
| `architecture-research` | Researches architectural topics and provides recommendations. |
| `effort-estimation-wbs` | Estimates effort using WBS (Top-Down and Bottom-Up) methods. |
| `sql-schema-generator` | Generates SQL schemas from requirements. |
| `test-case-generator` | Creates test cases for functional and non-functional requirements. |

#### Public Prompts

| Prompt | Description |
|--------|-------------|
| `ai-prompt-engineering-safety-review` | Reviews prompts for safety and effectiveness. |
| `apple-appstore-reviewer` | Simulates App Store review for iOS apps. |
| `architecture-blueprint-generator` | Generates architecture diagrams and blueprints. |
| `azure-cost-optimize` | Azure cost optimization recommendations. |
| `breakdown-epic-arch` | Breaks down epics from an architecture perspective. |
| `breakdown-epic-pm` | Breaks down epics from a PM perspective. |
| `breakdown-feature-implementation` | Creates implementation plans for features. |
| `breakdown-feature-prd` | Converts features into PRD format. |
| `create-readme` | Generates README files for projects. |
| `create-specification` | Creates technical specifications. |
| `create-technical-spike` | Designs technical spike investigations. |
| `dataverse-python-advanced-patterns` | Advanced Dataverse Python patterns. |
| `dataverse-python-production-code` | Production-ready Dataverse Python code. |
| `dataverse-python-quickstart` | Quick start guide for Dataverse Python. |
| `dataverse-python-usecase-builder` | Builds Dataverse use cases in Python. |
| `devops-rollout-plan` | Creates DevOps rollout plans. |
| `first-ask` | Initial requirement gathering prompt. |
| `gen-specs-as-issues` | Generates GitHub issues from specifications. |
| `istqb-iso25010-breakdown-test` | Creates test plans based on ISTQB/ISO 25010. |
| `sql-code-review` | Reviews SQL code for quality and performance. |
| `sql-optimization` | Optimizes SQL queries for performance. |

---

### Skills

Skills are self-contained capabilities with scripts and resources that extend agent functionality.

#### Custom Skills

| Skill | Description |
|-------|-------------|
| `docx` | Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). |

#### Public Skills

| Skill | Description |
|-------|-------------|
| `agentic-eval` | Evaluation framework for agentic AI systems. |
| `chrome-devtools` | Chrome DevTools automation and inspection. |
| `copilot-sdk` | GitHub Copilot SDK integration patterns. |
| `gh-cli` | GitHub CLI automation and scripting. |
| `git-commit` | Conventional commit message generation. |
| `github-issues` | GitHub Issues management automation. |
| `make-skill-template` | Template for creating new skills. |
| `markdown-to-html` | Converts Markdown to styled HTML. |
| `microsoft-code-reference` | Microsoft code reference documentation. |
| `microsoft-docs` | Microsoft documentation search and reference. |
| `prd` | Product Requirements Document generation. |
| `refactor` | Code refactoring patterns and automation. |
| `vscode-ext-commands` | VS Code extension command patterns. |
| `vscode-ext-localization` | VS Code extension localization. |
| `web-design-reviewer` | Web design review and feedback. |
| `webapp-testing` | Web application testing automation. |

#### Superpowers Skills

Workflow skills from the [Superpowers](https://github.com/superpowers-ai/superpowers) plugin for Claude Code, included with attribution.

| Skill | Description |
|-------|-------------|
| `brainstorming` | Collaborative design exploration before implementation. Explores user intent, requirements and design through dialogue. |
| `dispatching-parallel-agents` | Dispatch 2+ independent tasks to parallel subagents without shared state. |
| `executing-plans` | Execute written implementation plans in a session with review checkpoints. |
| `finishing-a-development-branch` | Guide completion of development work with structured merge, PR, or cleanup options. |
| `receiving-code-review` | Handle code review feedback with technical rigor and verification. |
| `requesting-code-review` | Dispatch code reviewer subagent to catch issues before merging. |
| `subagent-driven-development` | Execute plans by dispatching fresh subagent per task with two-stage review. |
| `systematic-debugging` | Systematic approach to debugging bugs, test failures, and unexpected behavior. |
| `test-driven-development` | TDD workflow for features and bugfixes — write tests before implementation. |
| `using-git-worktrees` | Create isolated git worktrees for feature work and implementation plans. |
| `verification-before-completion` | Verify work is complete with evidence before claiming success. |
| `writing-plans` | Write comprehensive implementation plans with bite-sized tasks. |
| `frontend-design` | Create distinctive, production-grade frontend interfaces that avoid generic AI aesthetics. |

> **Note:** For Claude Code downloads, multi-file skills are dynamically bundled into a single `.md` slash command. Companion files (markdown, scripts, templates) are inlined with appropriate formatting. For Copilot, the full directory structure is preserved.

---

## Adding Custom Assets

See [HOWTO.md](HOWTO.md) for instructions on extending this library with your own files.

## Version

Current Version: **1.0.5**
