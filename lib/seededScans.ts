import type { ScanResult } from "./types";

/**
 * STAGE 2 (offline) · Hand-authored scans that stand in for a live Anthropic
 * call while testing without an API key. These were written by applying the
 * Prompt B spec by hand (bands, glossed jargon, lookalike cross-refs, the
 * match_pct-vs-odds_pct gap) so the app produces real, varied, in-voice
 * output at zero cost. Keyed by normalized name; unknown names fall through
 * to the generic mock. Delete or ignore once ANTHROPIC_API_KEY is live.
 */

function norm(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SEEDS: Record<string, ScanResult> = {
  "aamir tinwala": {
    tagline: "The Coppell Optimizer",
    evidence: [
      {
        category: "Business Ventures",
        title: "Ascynd — car-inspired gymwear brand",
        detail: "'Design intention' is doing a lot of work in that tagline.",
      },
      {
        category: "Conservation",
        title: "Backyard Bird Project · 500+ nesting boxes",
        detail: "The one genuinely good thing, now also content.",
      },
      {
        category: "Press",
        title: "Featured in SHOUTOUT DFW",
        detail: "A profile that reads like he wrote the questions.",
      },
      {
        category: "Pedigree",
        title: "St. Mark's School of Texas",
        detail: "Roughly a mid-size mortgage per diploma.",
      },
    ],
    punch_worthiness: {
      score: 71,
      cut_round: "date_event",
      label: "No Second Dinner",
      roast:
        "You'd claw to the date event on the founder story and a handshake you've clearly rehearsed in a mirror. Then a member asks whether you actually care about the gymwear or the birds, you say 'both,' and the whole table watches you try to hold a straight face while lying to people who invented the move.",
      why: "You assembled a founder's résumé before you assembled a personality to hang it on: a car-themed gym brand, a bird charity, a puff-piece interview you all but ghostwrote. It is a beautiful stack of extracurriculars aimed with laser precision at an admissions office, and the clubs can smell an application from across the room. They cut you not because you fall short, but because you are so nakedly auditioning, and nothing kills a punch faster than wanting it this loudly.",
    },
    sellout_index: {
      score: 79,
      label: "Founder-Coded",
      why: "You didn't sell out to a bank, you cut out the middleman and became the product, the founder, and the marketing department in one trench coat. Ascynd sells fabric and the fabric sells you. 'Building in public' is a generous phrase for filming yourself doing homework and captioning it a journey.",
    },
    legacy_multiplier: {
      score: 62,
      difficulty: "EASY",
      label: "Daddy Ventures",
      why: "The pitch is scrappy teenage hustle; the cap table is your father. He wrote the first check and issued the confidence, your mother ran the charity's logistics, and St. Mark's handed you a network most adults would trade a kidney for. You didn't climb the ladder, you were born a few rungs up, and most of the branding budget went toward hiding the ladder.",
    },
    paper_trail: {
      score: 38,
      label: "Statement Pending",
      notes: [
        "Two websites, one press feature, not a single unscripted moment.",
        "@aamir.tin: a feed of soft launches for products nobody requested.",
        "Suspiciously clean, which just means the mess is offline.",
      ],
      why: "There is no dirt because there is no spontaneity; every pixel has been focus-grouped by someone who treats his own adolescence like a brand deck. That isn't innocence, it's media training. The most damning thing a reporter could file is that there was nothing to file.",
    },
    human_moat: {
      score: 55,
      label: "Thin Moat",
      why: "Strip the LinkedIn and the color-coded calendar and you're left with a gym brand any model could design and a charity mission any model could write in one prompt. The single thing an AI cannot fake is physically handing a family a birdhouse, so guard that, because the rest of the empire is a Canva subscription with good lighting.",
    },
    gunner_rating: {
      score: 76,
      label: "Terminally Optimized",
      why: "'Alignment, not balance' is what you tell yourself so you never have to admit you don't know how to stop. The calendar is carved into a brand, a charity, and content about the brand and the charity, and the tragedy is that none of it is for fun. You are grinding a personal brand at the exact age the only correct move is to be uselessly, forgettably young.",
    },
    certifiably_cracked: {
      score: 54,
      label: "Packaging, Not Genius",
      why: "The bird project is genuinely good, which is precisely why you couldn't resist strip-mining it for a founder narrative. Ascynd is competent execution of an idea that already lived in forty other browser tabs. The real talent on display isn't design or conservation, it's packaging, and packaging is the one thing Harvard already has a dangerous surplus of.",
    },
    final_club: {
      club: "The Fly",
      match_pct: 68,
      odds_pct: 6,
      traits: ["POLISHED", "TRYING", "MINGLER"],
      line: "The Fly runs on money, polish, and the ability to work a room, and you've been rehearsing all three since before you had a license. They'd take you eventually, and you'd call it your safety in the same breath you updated the bio.",
      lookalike: {
        name: "Mark Zuckerberg",
        line: "The founder who builds the product and the personal brand in one motion and narrates the whole thing to an audience that never asked. He got rejected by the clubs too and turned the resentment into a company. You're turning it into a merch drop. Aim higher, or at least stop filming.",
        pct: 84,
      },
    },
  },

  "mark zuckerberg": {
    punch_worthiness: {
      score: 22,
      cut_round: "none",
      label: "Not On The List",
      roast:
        "You didn't get cut at the cocktail hour. There was no cocktail hour. So you hacked the house facebooks, got hauled before the Ad Board, and built your own club with a two-billion-person membership and no blackball.",
      why: "Kirkland House, a fraternity that wasn't a final club, and a very specific grudge about the rooms you weren't in. The Porcellian did not call. The whole company is arguably a subtweet of that silence. You won the war and still check who's punching.",
    },
    sellout_index: {
      score: 90,
      label: "Signed To Himself",
      why: "The pipeline never got a shot at you because you became the thing the pipeline invests in. HCCG would have been a demotion. You are what the sophomore-fall recruiters point at when they say 'or you could build something,' knowing you won't.",
    },
    legacy_multiplier: {
      score: 46,
      difficulty: "NORMAL",
      label: "Exeter Tailwind",
      why: "A dentist's comfort in Dobbs Ferry and a Phillips Exeter diploma is not old money, but it is a running start most of the Yard would take. Nobody bailed you out; nobody needed to. You ran it on Normal and shipped a myth about the garage.",
    },
    paper_trail: {
      score: 88,
      label: "Statement Pending",
      notes: [
        "Facemash. The Ad Board kept the file.",
        "There is an IM from 2004 he would pay to unsend.",
        "The Winklevii still have a folder, and time.",
      ],
      why: "This is reputation-management territory with a legal department attached. A congressional hearing, a movie you didn't authorize, and a paper trail that reporters pull on for sport. Cleared, mostly. Forgotten, never.",
    },
    human_moat: {
      score: 80,
      label: "You Are The Moat",
      why: "Claude can write the product spec and refactor the newsfeed ranker. It cannot reproduce the paranoia, the timing, or the willingness to testify. What survives you is not the code. It's the instinct about who to acquire before they're a threat.",
    },
    gunner_rating: {
      score: 76,
      label: "Ships At 4 AM",
      why: "You built Facemash overnight, allegedly not sober, to settle a personal score. That is Lamonster energy weaponized. The curve didn't get wrecked so much as the entire concept of a quiet Tuesday did.",
    },
    certifiably_cracked: {
      score: 82,
      label: "Actually Built It",
      why: "Strip the mythology and there is still a genuinely cracked sophomore who scaled a real system faster than the grownups thought possible. The thesis went unwritten because the demo ate Harvard first. That counts, annoyingly.",
    },
    final_club: {
      club: "The Phoenix",
      match_pct: 54,
      odds_pct: 3,
      traits: ["ECLECTIC", "RESENTFUL", "SELF-MADE"],
      line: "You'd technically fit the Phoenix, the club with no fixed identity, which is the most polite way anyone has ever described being turned down by all the others.",
      lookalike: {
        name: "Bill Gates",
        line: "Left before the punch could officially say no, then spent decades making the basement look small. He at least seemed at peace with it; you built a war room and called it a newsfeed.",
      },
    },
  },

  "bill gates": {
    punch_worthiness: {
      score: 18,
      cut_round: "none",
      label: "Not On The List",
      roast:
        "You can't get cut from a process you left before it started. You were reading MITS assembler in Currier while the punch class practiced looking effortless at the River.",
      why: "You were gone before sophomore spring, which is the only exit strategy that beats a blackball. The clubs never got a look, and the joke is they'd have taken you now for the naming gift alone. Timing was always your best subject.",
    },
    sellout_index: {
      score: 84,
      label: "Refreshingly Unemployable",
      why: "You didn't get pulled toward the pipeline; you left the building the pipeline recruits into. There is no version of you filling out a HCCG application. The dorm-room company was the sellout index registering a hard error.",
    },
    legacy_multiplier: {
      score: 58,
      difficulty: "EASY",
      label: "Lakeside Tailwind",
      why: "A Seattle lawyer's household and a private school with a computer terminal in 1968 is a rarer advantage than most trust funds. This is not the Quad's story. The head start was real; you just also happened to be relentless with it.",
    },
    paper_trail: {
      score: 62,
      label: "Statement Pending",
      notes: [
        "A mugshot from New Mexico, 1977, aged suspiciously well.",
        "Antitrust: the deposition tapes exist.",
        "Filed under: things that aged poorly, then fine, then complicated.",
      ],
      why: "Public-figure gossip energy, decades of it, most of it litigated into a truce. The trail is long but the roads have all been repaved by a foundation. Reporters still know where the potholes were.",
    },
    human_moat: {
      score: 78,
      label: "You Are The Moat",
      why: "The BASIC interpreter is a museum piece Claude could rewrite before lunch. The thing that doesn't automate is the read on which market to strangle and when to pivot to philanthropy. Strategy is the moat; the code was always the easy part.",
    },
    gunner_rating: {
      score: 88,
      label: "Curve-Wrecker",
      why: "You reportedly took the hardest math course offered, stopped attending, and still made the grade a rumor. That is not studying, that is intimidation. The pre-meds in Lamont would have found your relationship to sleep genuinely concerning.",
    },
    certifiably_cracked: {
      score: 90,
      label: "Phi Beta Dropout",
      why: "Genuinely, structurally cracked, in a way the honor society exists to certify and you left before it could. The contribution wasn't a thesis. It was an entire industry's operating assumptions.",
    },
    final_club: {
      club: "The Porcellian",
      match_pct: 60,
      odds_pct: 5,
      traits: ["RICH", "RESTRAINED", "ABSENT"],
      line: "The Porcellian prizes old money that never shows up, so you're a philosophical fit and a practical impossibility. You'd have skipped the final dinner to read a manual anyway.",
      lookalike: {
        name: "Mark Zuckerberg",
        line: "Another dropout who out-earned every basement on Mount Auburn Street and never quite stopped keeping score. He made a movie's worth of resentment out of it; you made a foundation. Same wound, better PR.",
      },
    },
  },

  "conan obrien": {
    punch_worthiness: {
      score: 71,
      cut_round: "date_event",
      label: "No Second Dinner",
      roast:
        "You made it to the date event on sheer bit-work, then did four minutes of material about the club's own oil portraits and watched the room decide you were a liability with a byline.",
      why: "The clubs liked you until they realized you'd describe them, accurately, on television. You were Lampoon president twice, which is a final club for people who bite the hand at the final dinner. You didn't need their basement; you had a masthead.",
    },
    sellout_index: {
      score: 24,
      label: "Refreshingly Unemployable",
      why: "The recruiting pipeline looked at a history-and-literature concentrator writing sketch comedy and quietly closed the folder. There was no world where you signed to Goldman. You sold out to late night instead, which pays worse and lasts longer.",
    },
    legacy_multiplier: {
      score: 34,
      difficulty: "NORMAL",
      label: "Modest Tailwind",
      why: "An Irish-Catholic doctor's household outside Boston, six siblings, no boathouse with your name on it. Comfortable and crowded, not gilded. You ran it on Normal and made the lack of a tailwind into most of your act.",
    },
    paper_trail: {
      score: 40,
      label: "Statement Pending",
      notes: [
        "A magna thesis on Faulkner and Flannery O'Connor. Genuinely.",
        "The 'I have a cross to bear' era, on tape.",
        "Everything he regrets, he already made a joke about first.",
      ],
      why: "Almost nothing aged poorly because you got to the material before any reporter could. Self-deprecation as a scorched-earth PR strategy. The only paper trail is the one you narrate on purpose.",
    },
    human_moat: {
      score: 86,
      label: "You Are The Moat",
      why: "A model can generate a monologue. It cannot generate the specific tall, self-loathing, string-dance commitment to a bit that dies on purpose so it can rise funnier. Timing and shamelessness don't fit in a context window.",
    },
    gunner_rating: {
      score: 44,
      label: "Blissfully Not Pre-Med",
      why: "You wrote a magna thesis, so you weren't coasting, but nobody in Lamont ever felt their curve threatened by the guy workshopping a sketch about Widener. The intensity went into the Castle, not the p-set.",
    },
    certifiably_cracked: {
      score: 78,
      label: "Award Of Excellence",
      why: "A serious thesis on Southern literature plus running the oldest humor magazine in the country twice is its own kind of cracked. You contributed something intellectually interesting; it just also had a punchline.",
    },
    final_club: {
      club: "The Fox",
      match_pct: 72,
      odds_pct: 14,
      traits: ["ARTSY", "SELF-AWARE", "TOO FUNNY"],
      line: "The Fox is where the writers and the theater kids land, so you're a real match, but they'd hesitate knowing you'd immortalize the low ceilings and the smoking room in a bit by Thursday.",
      lookalike: {
        name: "B.J. Novak",
        line: "Another Lampoon ironist who turned Harvard-grade meanness into a paycheck. He'd have blackballed himself for the material, and so would you. The clubs prefer their humor catered, not aimed back at them.",
      },
    },
  },

  "ken griffin": {
    punch_worthiness: {
      score: 52,
      cut_round: "outing",
      label: "Didn't Vibe On The Boat",
      roast:
        "You got the outing invite, then spent the boat ride explaining convertible bond arbitrage to a sophomore who wanted to talk about the Vineyard. The club decided you were a terminal with legs.",
      why: "You were running a fund from a Cabot House dorm room with a satellite dish on the roof while the punch class practiced small talk. The clubs sensed you were already somewhere more expensive. The fit was fine; the interest was mutual and lukewarm.",
    },
    sellout_index: {
      score: 97,
      label: "Signed To Himself",
      why: "Calling this a sellout index undersells it. You didn't get recruited into finance; you were trading from the dorm before the recruiters had a slide deck. The pipeline aspires to you. HCCG has a picture of you where a poster of a band should be.",
    },
    legacy_multiplier: {
      score: 55,
      difficulty: "NORMAL",
      label: "Boca Tailwind",
      why: "A comfortable Florida upbringing and a family that could absorb the risk of a teenager running a fund is real ballast, not a fairy tale trust. You had a floor. You just also happened to compound it into a naming gift larger than most endowments.",
    },
    paper_trail: {
      score: 58,
      label: "Statement Pending",
      notes: [
        "The dorm-room satellite dish. Facilities has notes.",
        "A divorce filing that briefly became required reading.",
        "Filed under: donations large enough to rename the argument.",
      ],
      why: "Public-figure scrutiny that comes standard with ten figures, mostly financial and civic rather than scandalous. The trail is long, lawyered, and increasingly carved into building facades. Reporters read the filings; students read the plaque.",
    },
    human_moat: {
      score: 74,
      label: "You Are The Moat",
      why: "The models that price the trades are the most automatable thing in the building, and you'd be the first to automate them. What survives is the appetite for risk at a size that makes other people nauseous. Nerve doesn't fit in a prompt.",
    },
    gunner_rating: {
      score: 62,
      label: "Curve-Wrecker",
      why: "You weren't pre-med, but running a live portfolio between p-sets is its own flavor of never sleeping. The gunner energy just pointed at the market instead of the MCAT. The curve you wrecked had a ticker.",
    },
    certifiably_cracked: {
      score: 70,
      label: "Award Of Excellence",
      why: "Building a working fund out of a dorm with a roof antenna is genuinely cracked, in the operational sense if not the scholarly one. You didn't publish; you compounded. The contribution has a market cap.",
    },
    final_club: {
      club: "The Porcellian",
      match_pct: 66,
      odds_pct: 22,
      traits: ["RICH", "RESTRAINED", "TERMINAL-CODED"],
      line: "The Porcellian likes quiet money and no parties, which suits you, but why get punched into a building when the honest move is to write the check and put your name on the whole graduate school.",
      lookalike: {
        name: "Mark Zuckerberg",
        line: "Another dorm-room operator who skipped the punch and bought the relevance later. He built the network; you bought the building. Neither of you ever needed a basement, which is exactly why the basements still talk about you.",
      },
    },
  },
};

export function seededScanFor(name: string): ScanResult | null {
  return SEEDS[norm(name)] ?? null;
}
