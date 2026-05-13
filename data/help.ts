export type Lens = {
  key: "see" | "sense" | "steer" | "intent";
  name: string;
  description: string;
  location: string;
};

export const LENSES: Lens[] = [
  {
    key: "see",
    name: "SEE",
    description:
      "The structural view: what steps a workflow runs and how they connect. Use it when you need to confirm what's actually wired up.",
    location: "Flow tab → Step, Node, Timeline, Run history",
  },
  {
    key: "sense",
    name: "SENSE",
    description:
      "Continuous signal: a health score, learned baselines, and detected anomalies. Tells you when reality is drifting from normal.",
    location: "Health tab",
  },
  {
    key: "steer",
    name: "STEER",
    description:
      "Recommended actions with fine-grained control, swappable components, and human guardrails. Lets you intervene safely.",
    location: "Actions tab",
  },
  {
    key: "intent",
    name: "INTENT",
    description:
      "Why this workflow exists, the SLOs it promises, who depends on it, and what it expects from each dependency.",
    location: "Intent tab",
  },
];

export type KeyTerm = {
  term: string;
  definition: string;
};

export const KEY_TERMS: KeyTerm[] = [
  {
    term: "Silent failure",
    definition:
      "A run that reported success but produced no real output. The most dangerous failure mode in automation, because standard alerts don't fire.",
  },
  {
    term: "Health score",
    definition:
      "0–100 score per workflow. Combines run success rate, anomaly severity, and dependency health. 80+ healthy, 60–79 degraded, below 60 critical.",
  },
  {
    term: "Baseline drift",
    definition:
      "When a learned metric (payload shape, run duration, output volume) moves outside its observed range. Often the first sign of an upstream change.",
  },
  {
    term: "Blast radius",
    definition:
      "What an action will affect: in-flight runs, queued items, downstream workflows. Shown before you commit in the Actions side sheet.",
  },
  {
    term: "Reversibility",
    definition:
      "Whether an action can be undone in one click. Reversible actions get a lighter confirm gate, non-reversible actions require typed confirmation.",
  },
  {
    term: "Cooldown",
    definition:
      "Minimum interval between repeat alerts for the same rule. Prevents notification floods when a workflow is in a flapping state.",
  },
  {
    term: "Learning system",
    definition:
      "The runtime that observes recent runs, builds baselines, and surfaces anomalies. Confidence rises as it sees more runs and drops when reality stops matching the baseline.",
  },
];

export type FAQ = {
  question: string;
  answer: string;
};

export const FAQS: FAQ[] = [
  {
    question: "How does Blindspot detect silent failures?",
    answer:
      "Blindspot compares each run's output against its learned baseline. When a workflow reports success but its payload, duration, or output count falls outside the observed range, it's flagged as a silent failure even though the platform itself called it healthy.",
  },
  {
    question: "What does the learning system do?",
    answer:
      "It watches recent runs to build a baseline for each step: typical duration, payload shape, output counts, error rates. As reality changes, it updates. When current runs stop matching the baseline, the system raises an anomaly with a confidence score so you can judge whether to act.",
  },
  {
    question: "How are alert routing rules applied?",
    answer:
      "Each rule maps a severity (Critical, Warning, Notice) to a destination (Slack, PagerDuty, Email, etc.) with a cooldown. When an anomaly fires, every active rule for that severity sends one alert, respecting its cooldown so you don't get paged twice for the same incident.",
  },
  {
    question: "Can I undo an action after I commit it?",
    answer:
      "Most actions are reversible: pause has a resume button, rollback has a redeploy button, notifications can be sent again. Non-reversible actions (like cancelling in-flight runs) are marked clearly and require a typed confirmation before committing.",
  },
  {
    question: "What counts as a workflow?",
    answer:
      "Any automated sequence of steps Blindspot pulls in from a source platform: a Zap, an n8n flow, a Make scenario, etc. The Flow tab shows the actual step graph; the Health tab tracks it over time.",
  },
];
