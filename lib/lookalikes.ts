/**
 * STAGE 2 DATA · Lookalike database — real Harvard-tied public figures the
 * final verdict compares the scanned person to. The LLM picks ONE by
 * archetype signal, then writes the comparison line off clubTruth +
 * roastAngle. All club facts are public lore, phrased as satire, never
 * invented wrongdoing. Rendered into the system prompt by
 * renderLookalikesForPrompt().
 */

export interface Lookalike {
  name: string;
  tie: string;
  archetype: string;
  matchWhen: string;
  clubTruth: string;
  roastAngle: string;
}

export const LOOKALIKES: Lookalike[] = [
  {
    name: "Mark Zuckerberg",
    tie: "College '06, left early",
    archetype: "The Visible Founder",
    matchWhen: "startups, shipping in public, an online presence built around building",
    clubTruth: "never made a final club; the defining movie about him casts the clubs as the thing he couldn't have",
    roastAngle: "built a social network because the existing one wouldn't punch him",
  },
  {
    name: "Bill Gates",
    tie: "College '77, left even earlier",
    archetype: "The Empire Dropout",
    matchWhen: "technical, empire-ambitious, treats institutions as optional",
    clubTruth: "left before punch season could get a look at him",
    roastAngle: "the only person whose dropout gap year is doing better than the endowment",
  },
  {
    name: "Conan O'Brien",
    tie: "College '85",
    archetype: "The Comp King",
    matchWhen: "comedy, writing, campus media, performing for approval",
    clubTruth: "Lampoon president twice, which is a final club for people who bite back",
    roastAngle: "proof the funniest room at Harvard has never needed a basement",
  },
  {
    name: "Barack Obama",
    tie: "Law School '91",
    archetype: "The Room-Commander",
    matchWhen: "politics, oratory, organizing, gravitas",
    clubTruth: "ran the Law Review instead; the clubs would have punched him retroactively once it was safe to",
    roastAngle: "institutions claim him now that the vote is unanimous",
  },
  {
    name: "Elizabeth Warren",
    tie: "Law School faculty",
    archetype: "The Plan Person",
    matchWhen: "policy, spreadsheets, righteous structure, receipts",
    clubTruth: "has a plan for the final clubs, and they would not enjoy it",
    roastAngle: "the only person the graduate boards are genuinely afraid of",
  },
  {
    name: "Natalie Portman",
    tie: "College '03, psychology",
    archetype: "The Did-the-Reading Celebrity",
    matchWhen: "arts success plus genuine academics, quiet discipline",
    clubTruth: "did the p-sets while famous; the clubs needed her more than she needed them",
    roastAngle: "your excuse for skipping section had an Oscar campaign and still showed up",
  },
  {
    name: "Matt Damon",
    tie: "College '92, left for a chalkboard",
    archetype: "The Humanities Golden Boy",
    matchWhen: "writing, acting, charm, productive underachievement",
    clubTruth: "wrote his way out before final dinner; the screenplay was cheaper than dues",
    roastAngle: "left with no degree and more Harvard cachet than any club tie",
  },
  {
    name: "Sheryl Sandberg",
    tie: "College '91, Ec, Phi Beta Kappa",
    archetype: "The Consultant Overachiever",
    matchWhen: "consulting, structured ambition, ladder fluency",
    clubTruth: "top of the Ec concentration and straight into the pipeline; the clubs can't compete with a recruiter's open bar",
    roastAngle: "leaned in before the term existed and hasn't leaned back since",
  },
  {
    name: "Yo-Yo Ma",
    tie: "College '76",
    archetype: "The Prodigy",
    matchWhen: "artistic mastery, monastic practice ethic, actual humility",
    clubTruth: "was better at seven than the punch class will be at anything; never needed a basement",
    roastAngle: "the one Harvard name nobody has ever resented, which should worry you",
  },
  {
    name: "Jeremy Lin",
    tie: "College '10, Ec",
    archetype: "The Overlooked Grinder",
    matchWhen: "athletics or quiet grind, underestimated then vindicated",
    clubTruth: "the clubs missed him the way the scouts did; everyone claims him now",
    roastAngle: "your redemption arc requires being good first",
  },
  {
    name: "Ken Griffin",
    tie: "College '89, traded from his dorm room",
    archetype: "The Dorm-Room Financier",
    matchWhen: "finance, markets, money early and loudly",
    clubTruth: "skipped the punch and bought the naming rights later; the graduate school literally carries his name",
    roastAngle: "why get punched into a building when you can be the building",
  },
  {
    name: "Al Gore",
    tie: "College '69",
    archetype: "The Earnest Warner",
    matchWhen: "earnest policy, environment, long memos nobody asked for",
    clubTruth: "roomed with Tommy Lee Jones and still lost the charisma primary in his own suite",
    roastAngle: "right about everything, punched for none of it",
  },
  {
    name: "Rashida Jones",
    tie: "College '97, Hasty Pudding",
    archetype: "The Beloved Socialite",
    matchWhen: "genuinely likable, arts plus effortless social ease",
    clubTruth: "Pudding royalty; the clubs punch people hoping they arrive with her energy",
    roastAngle: "the vibe every punch class is trying to hire",
  },
  {
    name: "B.J. Novak",
    tie: "College '01, Lampoon",
    archetype: "The Ironist",
    matchWhen: "writing, irony, observational meanness as a career",
    clubTruth: "the Lampoon taught him to roast; the clubs prefer their humor catered",
    roastAngle: "would have blackballed himself for the material",
  },
];

export function renderLookalikesForPrompt(): string {
  return LOOKALIKES.map(
    (l) =>
      `- **${l.name}** (${l.tie}) · ${l.archetype}. Match when: ${l.matchWhen}. Club truth: ${l.clubTruth}. Roast angle: ${l.roastAngle}.`
  ).join("\n");
}
