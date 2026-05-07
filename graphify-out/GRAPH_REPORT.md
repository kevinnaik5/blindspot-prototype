# Graph Report - blindspot-prototype  (2026-05-07)

## Corpus Check
- 37 files · ~206,758 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 76 nodes · 168 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `415c5b32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 20 edges
2. `getWorkflow()` - 8 edges
3. `relativeFromNow()` - 7 edges
4. `shortDateTime()` - 6 edges
5. `getRuns()` - 4 edges
6. `serviceLabel()` - 3 edges
7. `ServiceIcon()` - 3 edges
8. `HandoffLink()` - 3 edges
9. `getActions()` - 3 edges
10. `FlowTabPage()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `FlowTabPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/page.tsx → data/workflows.ts
- `HealthPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/health/page.tsx → data/workflows.ts
- `ActionsPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/actions/page.tsx → data/workflows.ts

## Communities (11 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.26
Nodes (3): HandoffLink(), getHealth(), cn()

### Community 1 - "Community 1"
Cohesion: 0.24
Nodes (5): ActionsPage(), getWorkflow(), HealthPage(), FlowTabPage(), GraphView()

### Community 2 - "Community 2"
Cohesion: 0.27
Nodes (3): ServiceIcon(), serviceLabel(), getStepDetails()

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (3): getRuns(), relativeFromNow(), shortDateTime()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Why does `getWorkflow()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `relativeFromNow()` connect `Community 4` to `Community 0`, `Community 2`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `getWorkflow()` (e.g. with `FlowTabPage()` and `HealthPage()`) actually correct?**
  _`getWorkflow()` has 3 INFERRED edges - model-reasoned connections that need verification._