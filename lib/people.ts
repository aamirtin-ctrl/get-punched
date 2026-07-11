/**
 * The portrait wall — real public figures with Harvard ties, styled like
 * vintage yearbook cards. Images live at /public/portraits/<slug>.jpg
 * (AI-generated sepia headshots); a monogram tile renders until each image
 * is dropped in.
 */

export interface Person {
  slug: string;
  name: string;
  line: string;
  pct: number;
}

export const PEOPLE: Person[] = [
  { slug: "zuckerberg", name: "MARK ZUCKERBERG", line: "Most Likely to Drop Out on Top", pct: 94 },
  { slug: "portman", name: "NATALIE PORTMAN", line: "Most Likely to Win an Oscar", pct: 34 },
  { slug: "obama", name: "BARACK OBAMA", line: "Most Likely to Run for President", pct: 21 },
  { slug: "gates", name: "BILL GATES", line: "Most Likely to Build an Empire", pct: 91 },
  { slug: "conan", name: "CONAN O'BRIEN", line: "Most Likely to Make You Laugh", pct: 19 },
  { slug: "damon", name: "MATT DAMON", line: "Most Likely to Solve the Chalkboard", pct: 42 },
  { slug: "sandberg", name: "SHERYL SANDBERG", line: "Most Likely to Lean In", pct: 71 },
  { slug: "yoyo-ma", name: "YO-YO MA", line: "Most Likely to Practice More Than You", pct: 12 },
  { slug: "griffin", name: "KEN GRIFFIN", line: "Most Likely to Rename a Building", pct: 97 },
  { slug: "warren", name: "ELIZABETH WARREN", line: "Most Likely to Have a Plan for That", pct: 38 },
  { slug: "lin", name: "JEREMY LIN", line: "Most Likely to Break the Bracket", pct: 27 },
  { slug: "gore", name: "AL GORE", line: "Most Likely to Warn You", pct: 44 },
];
