# Graph Report - blindspot-prototype  (2026-05-13)

## Corpus Check
- 43 files · ~214,465 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 107 nodes · 212 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `83550372`
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 22 edges
2. `getWorkflow()` - 10 edges
3. `Blindspot` - 10 edges
4. `relativeFromNow()` - 8 edges
5. `shortDateTime()` - 6 edges
6. `getRuns()` - 4 edges
7. `serviceLabel()` - 3 edges
8. `ServiceIcon()` - 3 edges
9. `HandoffLink()` - 3 edges
10. `getActions()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `FlowTabPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/page.tsx → data/workflows.ts
- `HealthPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/health/page.tsx → data/workflows.ts
- `IntentPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/intent/page.tsx → data/workflows.ts
- `ActionsPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/actions/page.tsx → data/workflows.ts

## Communities (13 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (5): HandoffLink(), getHealth(), getRuns(), relativeFromNow(), shortDateTime()

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (3): LensHeader(), getActions(), FocusableActionItem()

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (12): Blindspot, code:bash (git clone https://github.com/kevinnaik5/blindspot-prototype.), code:block2 (app/), Credits, Demo walkthrough, Local development, Project structure, Scope and limitations (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.3
Nodes (5): ActionsPage(), getWorkflow(), HealthPage(), FlowTabPage(), IntentPage()

### Community 4 - "Community 4"
Cohesion: 0.27
Nodes (4): ServiceIcon(), serviceLabel(), getStepDetails(), cn()

## Knowledge Gaps
- **9 isolated node(s):** `The problem`, `The framework`, `Demo walkthrough`, `What's in the prototype`, `Tech stack` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 4` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `getWorkflow()` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `relativeFromNow()` connect `Community 0` to `Community 8`, `Community 1`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `getWorkflow()` (e.g. with `FlowTabPage()` and `HealthPage()`) actually correct?**
  _`getWorkflow()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `The problem`, `The framework`, `Demo walkthrough` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._