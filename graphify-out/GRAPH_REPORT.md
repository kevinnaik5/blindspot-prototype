# Graph Report - blindspot-prototype  (2026-05-07)

## Corpus Check
- 40 files · ~210,084 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 85 nodes · 184 edges · 11 communities (8 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `744751d7`
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
1. `cn()` - 21 edges
2. `getWorkflow()` - 10 edges
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
- `IntentPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/intent/page.tsx → data/workflows.ts
- `ActionsPage()` --calls--> `getWorkflow()`  [INFERRED]
  app/workflows/[id]/actions/page.tsx → data/workflows.ts

## Communities (11 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (5): HandoffLink(), getHealth(), getRuns(), relativeFromNow(), shortDateTime()

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (3): LensHeader(), getActions(), FocusableActionItem()

### Community 2 - "Community 2"
Cohesion: 0.27
Nodes (3): ServiceIcon(), serviceLabel(), getStepDetails()

### Community 4 - "Community 4"
Cohesion: 0.38
Nodes (5): ActionsPage(), getWorkflow(), HealthPage(), FlowTabPage(), IntentPage()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Why does `getWorkflow()` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `relativeFromNow()` connect `Community 0` to `Community 1`, `Community 2`, `Community 5`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `getWorkflow()` (e.g. with `FlowTabPage()` and `HealthPage()`) actually correct?**
  _`getWorkflow()` has 4 INFERRED edges - model-reasoned connections that need verification._