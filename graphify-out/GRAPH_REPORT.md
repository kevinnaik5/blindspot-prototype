# Graph Report - blindspot-empty-state  (2026-05-13)

## Corpus Check
- 54 files · ~220,219 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 147 nodes · 282 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4144babd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 26 edges
2. `relativeFromNow()` - 11 edges
3. `getWorkflow()` - 10 edges
4. `Blindspot` - 10 edges
5. `Blindspot` - 10 edges
6. `shortDateTime()` - 6 edges
7. `getRuns()` - 5 edges
8. `serviceLabel()` - 3 edges
9. `ServiceIcon()` - 3 edges
10. `HandoffLink()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `FlowTabPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/page.tsx → data/workflows.ts
- `HealthPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/health/page.tsx → data/workflows.ts
- `IntentPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/intent/page.tsx → data/workflows.ts
- `ActionsPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/actions/page.tsx → data/workflows.ts

## Communities (15 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (3): HandoffLink(), cn(), GraphView()

### Community 1 - "Community 1"
Cohesion: 0.2
Nodes (3): getHealth(), getRuns(), shortDateTime()

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (4): LensHeader(), WorkflowBackLink(), getActions(), FocusableActionItem()

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (3): QuickStart(), SeverityBar(), SeverityIcon()

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (12): Blindspot, code:bash (git clone https://github.com/kevinnaik5/blindspot-prototype.), code:block2 (app/), Credits, Demo walkthrough, Local development, Project structure, Scope and limitations (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (12): Blindspot, code:bash (git clone https://github.com/kevinnaik5/blindspot-prototype.), code:block2 (app/), Credits, Demo walkthrough, Local development, Project structure, Scope and limitations (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (3): ServiceIcon(), serviceLabel(), getStepDetails()

### Community 8 - "Community 8"
Cohesion: 0.38
Nodes (5): ActionsPage(), getWorkflow(), HealthPage(), FlowTabPage(), IntentPage()

## Knowledge Gaps
- **18 isolated node(s):** `The problem`, `The framework`, `Demo walkthrough`, `What's in the prototype`, `Tech stack` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 7`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `getWorkflow()` connect `Community 8` to `Community 2`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `relativeFromNow()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 7`, `Community 9`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `getWorkflow()` (e.g. with `FlowTabPage()` and `HealthPage()`) actually correct?**
  _`getWorkflow()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `The problem`, `The framework`, `Demo walkthrough` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._