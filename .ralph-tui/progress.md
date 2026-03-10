# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

---

## [2026-03-10] - US-013
- Verified existing frontend architecture documentation
- File: docs/zh/04-frontend/01-overview.md
- **Learnings:**
  - Frontend uses Vue 3 Composition API with `<script setup>` syntax throughout
  - State management uses lightweight reactive store pattern (no Pinia/Vuex)
  - Router configured with Vue Router 4, all routes use `props: true`
  - API layer organized into graph.js, simulation.js, report.js with Axios
  - D3.js used for graph visualization in GraphPanel component
  - Project structure: views/ (pages), components/ (reusable), api/ (services), store/ (state)

---

## [2026-03-10] - US-014
- Enhanced frontend component documentation with comprehensive props/events and interaction diagrams
- File: docs/zh/04-frontend/02-components.md
- **Files changed:**
  - docs/zh/04-frontend/02-components.md (enhanced with Mermaid diagrams, detailed props/events, workflow interactions)
- **Learnings:**
  - Component naming: Step1GraphBuild, Step2EnvSetup, Step3Simulation, Step4Report, Step5Interaction
  - MainView.vue acts as the primary container for Step1 (图谱构建)
  - All step components emit 'next-step' event to advance workflow, with optional params (e.g., maxRounds)
  - Step2 and Step3 support 'go-back' event for backward navigation
  - Common props across step components: projectData, graphData, systemLogs
  - GraphPanel is shared across all steps with currentPhase prop to indicate current step
  - Workflow state management through router parameters: projectId → simulationId → reportId
  - Step3Simulation handles dual-platform simulation (Twitter/Reddit) with action timeline visualization
  - Step4Report and Step5Interaction share reportId for continuation of workflow

---

## [2026-03-10] - US-015
- Verified existing frontend API integration documentation - already complete and comprehensive
- File: docs/zh/04-frontend/03-api-integration.md (1059 lines)
- **Learnings:**
  - Axios configured with 5-minute timeout for long-running operations (ontology generation)
  - Service layer organized into graph.js, simulation.js, report.js modules
  - Request/response interceptors handle success field checking and error logging
  - Retry mechanism uses exponential backoff (1s → 2s → 4s delays)
  - Polling intervals vary by scenario: 2000ms (basic status), 3000ms (profiles/detail), 1500ms (console logs)
  - Polling cleanup in onUnmounted is critical - must clear all timers to prevent memory leaks
  - Incremental log fetching uses from_line parameter to avoid retransmitting large data
  - Vite proxy configured for development: /api → http://localhost:5001

---

## [2026-03-10] - US-016
- Moved existing comprehensive integrations documentation from 06-integrations to 05-integrations per PRD specification
- File: docs/zh/05-integrations/01-overview.md (553 lines)
- **Files changed:**
  - Created: docs/zh/05-integrations/01-overview.md (moved from 06-integrations)
  - Updated: docs/zh/00-index.md (all references updated to new paths)
  - Renamed: docs/zh/07-deployment → docs/zh/06-deployment
  - Renamed: docs/zh/08-troubleshooting → docs/zh/07-troubleshooting
- **Learnings:**
  - Documentation structure renumbered for consistency: 03-backend → 04-frontend → 05-integrations → 06-deployment → 07-troubleshooting
  - Zep Cloud SDK integration includes: graph creation, semantic search, pagination for nodes/edges
  - LLM service supports OpenAI-compatible APIs with Alibaba Qwen (qwen-plus) recommended for cost-effectiveness
  - CAMEL-OASIS supports Twitter and Reddit platforms with specific action sets for each
  - Environment variables: ZEP_API_KEY (required), LLM_API_KEY/BASE_URL/MODEL_NAME (required)
  - Optional boost LLM config for non-critical tasks to reduce costs
  - Time simulation uses Chinese作息 pattern: dead hours (0-5), morning (6-8), work (9-18), peak (19-22), night (23)

---

## [2026-03-10] - US-017
- Verified existing deployment documentation - already complete and comprehensive
- Files: docs/zh/06-deployment/01-configuration.md (275 lines), 02-local-setup.md (530 lines), 03-docker.md (740 lines)
- **Learnings:**
  - Configuration docs include all env vars with LLM boost options, Flask/OASIS/Report Agent settings
  - Local setup uses uv for fast Python dependency management (10-100x faster than pip)
  - Docker deployment supports both pre-built images (ghcr.io/666ghj/mirofish:latest) and local build
  - Image acceleration available via ghcr.nju.edu.cn for China users
  - Production deployments include Nginx reverse proxy, HTTPS with certbot, resource limits, health checks
  - Troubleshooting sections address 8+ common issues per document with detailed solutions

---

## [2026-03-10] - US-018
- Verified existing troubleshooting documentation - already complete and comprehensive
- Files: docs/zh/07-troubleshooting/01-common-issues.md (639 lines), 02-debugging.md (635 lines)
- **Learnings:**
  - Common issues covers 7 major categories with structured problem description, root causes, solutions, and prevention
  - Issues include: API connection errors, authentication failures, simulation hangs, frontend build errors, graph building failures, file upload errors, abnormal simulation results
  - Debugging guide provides complete log system documentation with 4 log types and 5 log levels
  - Shell scripts included for health checks, diagnostic info collection, and database cleanup
  - Performance analysis tools covered: cProfile, memory_profiler, snakeviz, custom performance decorators
  - Remote debugging supported via SSH, rpdb, and Docker container access
  - Chinese localization maintained throughout with curl examples and bash scripts

---

## [2026-03-10] - US-019
- Created design patterns documentation covering Flask application architecture and core design patterns
- Files changed:
  - Created: docs/zh/08-design-patterns.md (comprehensive design patterns documentation)
- **Learnings:**
  - Application Factory Pattern: Flask's `create_app()` function enables test isolation, flexible configuration, and deferred initialization
  - Blueprint Pattern: Three blueprints (graph_bp, simulation_bp, report_bp) organize API routes with `/api/` prefix namespace
  - Dependency Injection Pattern: Config passed via `create_app(config_class)`, services as global singletons, callbacks for progress updates
  - Observer Pattern: `progress_callback` parameter in `prepare_simulation()` provides real-time feedback for long-running tasks with stages: reading, generating_profiles, generating_config
  - Strategy Pattern: `OasisAgentProfile` has `to_reddit_format()` and `to_twitter_format()` methods; platform-specific configs (Reddit uses JSON with karma, Twitter uses CSV with friend_count/follower_count)
  - Progress callback factory pattern: `_create_progress_callback(simulation_id)` creates closure that captures simulation_id for state updates

---

## [2026-03-10] - US-020
- Enhanced docs/zh/README.md with comprehensive documentation index and role-based reading paths
- Files changed:
  - docs/zh/README.md (added complete documentation navigation, role-based reading paths for backend/frontend/ops, document contribution guidelines)
  - docs/zh/00-index.md (fixed design-patterns.md reference from 09 to 08)
- **Learnings:**
  - Two design pattern files exist: 08-design-patterns.md (newer, created in US-019) and 09-design-patterns.md (older version)
  - Documentation structure: 00-index.md serves as dedicated navigation hub, README.md as project overview with embedded navigation
  - Role-based reading paths help different user personas quickly find relevant documentation
  - Chinese documentation uses emoji for visual categorization (📚 docs, 👨‍💻 backend, 🎨 frontend, 👨‍💼 ops, 🚀 deployment, 🛠️ troubleshooting)
  - All relative links within docs/zh/ directory use same-level references (e.g., 02-architecture.md, not ../02-architecture.md)
  - Quick start section already existed in README.md, enhanced with additional context

---