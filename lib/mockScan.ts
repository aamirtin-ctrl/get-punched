import type { ScanResult } from "./types";

/**
 * Fixture scan used when MOCK_SCAN=1, when the Anthropic key is missing, or
 * while /lib/scanPrompt.ts still holds the Prompt B placeholder. Keeps the
 * whole flow demoable without spending a token. Written in the Prompt B
 * voice, band-consistent with its scoring rules.
 */
export function mockScan(name: string): ScanResult {
  const first = name.split(" ")[0] || "You";
  return {
    punch_worthiness: {
      score: 68,
      cut_round: "date_event",
      label: "No Second Dinner",
      roast:
        "You survived the boat because you can fake a childhood of skiing. Then at the date event you asked a member what the club 'does,' and the table heard it.",
      why: `${first} interviews well and knows exactly one member from expos section, which is one more than most. The comp was over the second you said 'networking opportunity' without irony. They walked you out warmly. That was the blackball.`,
    },
    sellout_index: {
      score: 81,
      label: "Consultant-Coded",
      why: "You wrote 'impact at scale' in a cover letter and meant the signing bonus. HUCG rejected you once, so you applied twice. The offer letter arrived before your thesis topic did, and you told people it was a hard decision. It was not.",
    },
    legacy_multiplier: {
      score: 34,
      difficulty: "NORMAL",
      label: "Modest Tailwind",
      why: "No boathouse bears your surname, but nobody in your family flinched at the tuition number either. You are playing on Normal mode and describing it as Hard in every personal essay. The admissions committee noticed. So did we.",
    },
    paper_trail: {
      score: 55,
      label: "Statement Pending",
      notes: [
        "Deleted the finance club headshot. It's cached.",
        "The Crimson comment section remembers.",
        "A pattern, once you start looking for it.",
      ],
      why: "Nothing disqualifying, just a light residue of ambition across the public internet. A reporter would find it boring, which at Harvard is its own indictment. You are one screenshot away from a very quiet apology.",
    },
    human_moat: {
      score: 44,
      label: "Thin Moat",
      why: "The spreadsheets automate, the emails already read like a template, and the personality is a LinkedIn summary someone else could have written. What's irreplaceable about you is proving hard to locate. Claude can do the job; the only thing it can't replicate is your specific brand of wanting it, and wanting is not a skill.",
    },
    gunner_rating: {
      score: 83,
      label: "Curve-Wrecker",
      why: "You email professors at 1:47 AM 'just to follow up.' Your calendar has a color for 'strategic coffee' and Lamont has a chair with your outline in it. The curve moved because of you, and four pre-meds know your name the way sailors know a storm's.",
    },
    certifiably_cracked: {
      score: 47,
      label: "All Vibes, No Thesis",
      why: "Impressive by hometown standards, median by the Berg's. The award shelf is real; everyone here has the same shelf. When asked what you're actually working on, you describe a plan to have a plan. The committee noted the confidence.",
    },
    final_club: {
      club: "The Fox",
      match_pct: 74,
      odds_pct: 4,
      traits: ["ARTSY", "KIND", "ALTERNATIVE"],
      line: "Good enough to punch, not quite enough to legacy. You will join the Fox, tell people it was your first choice, and by senior spring you will almost believe it.",
      lookalike: {
        name: "Mark Zuckerberg",
        line: "Never made a final club and built a two-billion-user grudge about it. He at least shipped something out of the rejection; you'd have just refreshed your email.",
      },
    },
  };
}
