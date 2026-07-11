/**
 * STAGE 2 DATA · Harvard reference bank — the single source of truth for
 * campus jargon. Each term carries a gloss so the LLM uses it correctly
 * (wrong usage reads instantly fake to anyone who went). Rendered into the
 * system prompt by renderBankForPrompt(); never hardcode these in templates.
 *
 * Vetting notes are baked into the glosses (e.g. Harvard Time was abolished
 * in 2018, shopping week is dead, the consulting group is usually styled
 * HCCG) so the model can be period-accurate about its meanness.
 */

export interface BankEntry {
  term: string;
  gloss: string;
}

export const HARVARD_BANK: Record<string, BankEntry[]> = {
  finalClub: [
    { term: "punch (verb/noun)", gloss: "you don't rush, you get punched: a member has to invite you. The noun 'a punch' is the prospect being considered" },
    { term: "punchee", gloss: "a prospective member invited to the punch events; advances or gets cut" },
    { term: "the four rounds", gloss: "cocktail (first event), outing, date event, final dinner, in that order. The list is winnowed after each" },
    { term: "cuts", gloss: "the winnowing after every round; the group shrinks event to event until a select few remain" },
    { term: "blackball", gloss: "at the final vote, a single member's anonymous negative vote kills a candidacy outright. One 'no' beats every 'yes'" },
    { term: "neo (neophyte)", gloss: "a punch who survived the vote: elected but not yet fully initiated, a probationary new member. Once you're a neo you're no longer a 'punch'" },
    { term: "graduate board", gloss: "the club's alumni corporation; it owns the clubhouse and controls the money, and can overrule or shut down the undergraduates. The real power behind the velvet curtain" },
    { term: "club tie", gloss: "the identifying necktie (the Porcellian's white boars on green, the Fox's foxes); wearing it in public is the whole flex" },
    { term: "pre-selected", gloss: "the open secret: punch invites go to people who already know members or are legacies. The 'process' mostly confirms a decision already made" },
  ],
  places: [
    { term: "the Yard", gloss: "freshman dorms and tourist core; where everyone starts equal for about nine days" },
    { term: "the Berg (Annenberg)", gloss: "freshman dining hall; Hogwarts ceiling, middle-school social dynamics" },
    { term: "the Kong", gloss: "Hong Kong restaurant: late-night Chinese food, scorpion bowls, decisions" },
    { term: "Widener steps", gloss: "library steps; where prospective students take photos and actual students cry" },
    { term: "the Quad", gloss: "distant housing; say it with dread. Getting quadded is the first rejection Harvard hands you directly" },
    { term: "the River", gloss: "the River houses; where you wanted to be housed, and everyone knows it" },
    { term: "Lamont / the Lamonster", gloss: "24-hour library; the Lamonster is who you become inside it at 4 AM" },
    { term: "Primal Scream", gloss: "naked midnight lap of the Yard before finals; tradition as coping mechanism" },
    { term: "Mem Church", gloss: "Memorial Church; solemn, beautiful, mostly experienced during convocation and regret" },
    { term: "the John Harvard statue", gloss: "tourists rub the foot for luck; students know exactly why you never touch it" },
    { term: "Housing Day", gloss: "the March morning freshmen learn their upperclass House, revealed by costumed upperclassmen 'dorm-storming' the Yard. Getting Quadded is the dreaded outcome" },
    { term: "brain break", gloss: "the free late-night HUDS snack in the Houses around 9:30; a social ritual disguised as string cheese" },
  ],
  process: [
    { term: "punch", gloss: "final club recruitment: cocktail hour, outing, date event, final dinner. Invitation-only at every stage" },
    { term: "comp", gloss: "the long tortuous tryout to join the Crimson, Lampoon, or basically anything; a job interview lasting a semester" },
    { term: "concentration", gloss: "never say major. Saying major outs you faster than the lanyard" },
    { term: "secondary", gloss: "never say minor" },
    { term: "p-set", gloss: "problem set; a social currency and a cry for help" },
    { term: "shopping week", gloss: "the dead-but-mourned week of sampling classes before committing; RIP, replaced by pre-registration" },
    { term: "Harvard Time", gloss: "the abolished-in-2018 but culturally immortal convention that everything starts seven minutes late" },
    { term: "\"let's get lunch\"", gloss: "means nothing. A pleasantry with a 0% conversion rate; both parties know" },
    { term: "gem", gloss: "a notoriously easy class (under ~4 hours a week); the transcript-padding move, e.g. Nagy's 'Heroes' course" },
    { term: "Q Guide", gloss: "the course-evaluation database everyone reads before enrolling; a low Q score is a public warning label" },
    { term: "Ec 10", gloss: "the giant intro economics lecture; the on-ramp to the finance/consulting pipeline" },
    { term: "CS50", gloss: "the spectacle intro computer science course; the other pre-professional on-ramp, complete with a stadium-sized final event" },
    { term: "section", gloss: "the weekly TF-led discussion; 'sectioning' is talking too much in it to impress the room" },
    { term: "frosh", gloss: "freshman; from the German for frogs, which tells you the affection level" },
    { term: "the Grind", gloss: "the relentless academic pressure; the word has meant this at Harvard since the 1850s" },
  ],
  status: [
    { term: "the Consulting Group (HCCG)", gloss: "Harvard College Consulting Group, ~10% accept rate; harder to join than most clubs, prouder of it too" },
    { term: "Crimson byline", gloss: "writing for the daily paper; a comp that ends careers before they start" },
    { term: "IOP fixture", gloss: "Institute of Politics regular; networking dressed as civic duty" },
    { term: "Hasty Pudding", gloss: "theatricals and social institution; adjacent royalty" },
    { term: "Fall Pudding initiate", gloss: "punched by the Pudding in the fall; the actual punch-season kingmaker signal" },
    { term: "Rhodes / Marshall", gloss: "the scholarships; mentioned humbly, planned since sophomore fall" },
    { term: "Phi Beta Kappa", gloss: "academic honor society; Junior 24 is the flex, senior election is the consolation" },
    { term: "the Game", gloss: "Harvard-Yale football; the one weekend school spirit is permitted" },
    { term: "final dinner", gloss: "the last punch round; survive it and you're in, pending blackball" },
    { term: "blackball", gloss: "one anonymous member vote kills a punch. The institution's purest expression of itself" },
  ],
  selfAware: [
    { term: "\"Barney\"", gloss: "archaic Cambridge townie slur for a Harvard student; deploy for period flavor" },
    { term: "veritaffle", gloss: "dining hall waffle branded VE-RI-TAS; eating the logo is the whole joke" },
    { term: "the freshman plague", gloss: "the respiratory event that sweeps the Berg every October" },
    { term: "gap-year-at-a-startup energy", gloss: "archetype: deferred a year to 'build' and mentions it weekly" },
    { term: "\"I'm pre-med but exploring\"", gloss: "archetype: not exploring" },
    { term: "nepo-adjacent", gloss: "no famous parent, but a suspiciously smooth path and a godparent on a board" },
    { term: "legacy-and-it-shows", gloss: "the confidence of someone whose admission was decided in a previous generation" },
    { term: "dropping the H-bomb", gloss: "revealing you go to Harvard; the coward's dodge is 'I go to school in Boston,' which everyone sees through" },
    { term: "Annenburglary", gloss: "smuggling food or cutlery out of Annenberg to eat later; petty theft as a rite of passage" },
    { term: "Harvard married couple", gloss: "the pair who've dated since frosh fall and now move through campus as a single organism" },
  ],
};

export function renderBankForPrompt(): string {
  const section = (title: string, entries: BankEntry[]) =>
    `${title}:\n` + entries.map((e) => `- ${e.term} — ${e.gloss}`).join("\n");
  return [
    section("Final club process", HARVARD_BANK.finalClub),
    section("Places", HARVARD_BANK.places),
    section("Process", HARVARD_BANK.process),
    section("Status/social", HARVARD_BANK.status),
    section("Self-aware/mean", HARVARD_BANK.selfAware),
  ].join("\n\n");
}
