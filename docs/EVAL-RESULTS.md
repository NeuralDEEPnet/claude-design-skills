# Eval results

## v0.5.0 — design heritage — 2026-11-07

Executor: Claude Sonnet 5.5 via `claude plugin eval` (Claude Code 2.1.319), with/without ablation, 3 judge votes per assertion by a Sonnet judge, Write and Edit granted, Bash withheld, report not published. Two runs per arm per case (three for the dropped case). **Directional only.**

Three passes. Pass 1 ran all 12 cases and hit the account's 5-hour usage limit partway: both arms of `vague-premium-brief` and the with-arm of `reveal-vs-restraint-speaker` were scored 0 without being judged. Between passes 1 and 2 I changed things after reading the results: the `design-core` and router descriptions (they now name award-readiness and "good design" reviews), the Rapid card (a tagged declared-set example), and several graders that were over-literal or not verifiable from the trace (Sullivan wording, "each principle paired with an anti-principle", gold on links, the spacing-diff graders). Pass 2 re-ran the cut-off cases and every case whose graders or the skill text had changed. Scores below are from the latest valid pass for each case; the edited graders are not comparable with pass 1, and the run is not blind to my edits.

| Case | Pass | With | Without | Δ | Skill fired in the with-arm |
|---|---|---|---|---|---|
| heritage-bauhaus-guard (trap: four planted falsehoods) | 2 | 0.86 | 0.36 | +0.50 | yes |
| lean-unbranded-landing (regression; now 11 graders) | 1 | 0.86 | 0.36 | +0.50 | yes |
| heritage-rams-scorecard (trap: asks for numeric scores) | 2 | 0.59 | 0.27 | +0.32 | yes |
| printable-desk-robot (regression) | 1 | 0.43 | 0.14 | +0.29 | yes |
| vague-premium-brief (regression, re-run after the limit) | 2 | 0.75 | 0.50 | +0.25 | yes |
| reveal-vs-restraint-speaker | 2 | 0.46 | 0.23 | +0.23 | yes |
| heritage-swiss-rapid | 1 | 0.58 | 0.38 | +0.21 | yes |
| award-readiness-honest | 2 | 0.70 | 0.50 | +0.20 | yes (pass 1: no, 0.45 vs 0.50) |
| rapid-404-page (regression) | 1 | 0.57 | 0.43 | +0.14 | no |
| heritage-vs-client-identity | 2 | 0.65 | 0.77 | −0.12 | yes |
| heritage-targeted-revision-cheap | 2 | 0.81 | 1.00 | −0.19 | no |

Mean Δ over these 11 cases: +0.21. "Fired" is read from visible Skill calls and turn counts in the traces.

**What the runs show**
- Where the skill fired (9 of the 11 cases) the plugin beat the baseline in 8, by +0.20 to +0.50. The planted-falsehood case moved most: with the plugin the replies correct Sullivan 1896, the subway manual (Standard Medium, Helvetica only from December 1989) and the Parthenon (about 2.25), and decline to attribute an 8-pt grid to Braun; the baseline repeated or ignored them.
- **Firing is the main failure mode, as in v0.4.** With the first description the kettle award prompt never fired the skill (0 of 2: 0.45 vs 0.50, a single turn each); after the description named award-readiness and "good design" reviews it fired 2 of 2 (0.70 vs 0.50). `rapid-404-page` did not fire in either with-run. The two negative deltas split into noise and a real question: `heritage-targeted-revision-cheap` never fired the skill (both arms are the same behaviour: zero reference reads and no heritage block, which is the intended outcome, and the gap is two graders on reply format); `heritage-vs-client-identity` did fire, and its replies kept the client's gold, ornament and fonts, surfaced the tension and stated the Gropius 1925 position, so its deficit sits in graders that read "gold for links" literally (the agents used ink link text with a gold underline because gold on paper is about 2.8:1) and in sampling noise at two runs per arm.
- **Rapid heritage discipline is partly followed.** In `heritage-swiss-rapid` the agents read exactly `head -n 16` of `heritage.md` (the Rapid card and rules), named "Swiss = Helvetica" as an anti-principle, kept Helvetica out of the page and said what they had not rendered. They missed the basis tags on the declared set, and one reply ran 467 words against the 400-word Rapid budget. The Rapid card now shows a tagged one-line example; not re-run.
- A residue-audit case was dropped. Over 6 runs (three per arm) the skill never fired on an audit-only prompt, even rephrased as a design problem; both arms answered with the same single turn (0.47 with vs 0.53 without), so it could not discriminate. The pinned arithmetic (outliers 15, 17, 22, 30 at 4 px; 18 and 34 off a 1.25 scale) was recomputed by script and by a reviewer instead.

**Caveats**
- Two runs per arm: a single run moves a case mean by 0.1 to 0.2.
- Many assertions grade the skill against its own rules. The judge sees a capped part of the trace, so graders about tool use ("opens no reference file") are only as reliable as the visible part. Unanimous 0/3 fails on a reply that plainly meets the statement (for example two Sullivan and anti-principle graders in pass 1) were judge or wording errors, which is why those graders were rewritten.
- Pass 1 cost about US$168 and pass 2 about US$71 as reported by the tool.

## v0.4.0 — lean-unbranded-landing — 2026-11-05

Executor: Claude Sonnet 5.5 via `claude plugin eval` (with/without ablation, 3 runs per arm, 3 judge votes per assertion, Bash withheld because the host could not sandbox it). Directional only.

| Arm | Run 1 | Run 2 | Run 3 | Mean |
|---|---|---|---|---|
| with plugin | 5/9 | 4/9 | **8/9** | 0.63 |
| without | 3/9 | 3/9 | 4/9 | 0.37 |

Δ +0.26 over 6 runs. Runs 1–2 with the plugin ran on the house style *before* the Rapid response shape existed: both kept the artifact and the one-accent/one-family rule but dropped the depth line, the anti-principles and the contrast numbers. Run 3 ran after the response shape was added and passed every assertion except the word count, where two of three judges failed a 359-word response (under the 400 limit; the grader now says to exclude the written file). The baseline never stated a depth, never listed anti-principles, and said "readable contrast" without numbers.

**Clean rerun on the final text** (same setup, 6 runs):

| Arm | Run 1 | Run 2 | Run 3 | Mean |
|---|---|---|---|---|
| with plugin | 7/9 | 5/9 | 7/9 | 0.70 |
| without | 3/9 | 3/9 | 3/9 | 0.33 |

Δ +0.37. Runs 1 and 3 followed the Rapid response shape exactly (depth line, artifact, DNA with anti-principles, contrast numbers, honest render statement) at 349 and 350 words, yet all three judges failed the "under 400 words" assertion both times; the judges cannot count reliably, so that grader is now a qualitative compactness check (`07-response-is-compact`). Run 2 did not state the depth, the DNA or the contrast numbers, which looks like the skill not being read on that run; treat 1-in-3 as the current trigger variance on Sonnet. The baseline was stable at 3/9: one file, one accent, short response, and none of the design discipline.

**Third run** (compactness grader instead of word count, same setup): with plugin 6/9, 7/9, 6/9 (0.70); without 2/9, 3/9, 2/9 (0.26); Δ +0.44. All three with-runs followed the Rapid response shape at 330–375 words with computed contrast ratios and an explicit "not rendered" line, yet judges unanimously failed the compactness assertion on each, failed "one accent" twice, and once failed the honest-render assertion against a response that said "I haven't opened it in a browser". The judges see the trace, not the written HTML, and read six short headed blocks as "multi-section"; graders 03, 07 and 08 now say what to judge from (the response's own statements when the HTML is not visible, and the response shape rather than a word count).

**Final run** (evidence-aware graders, final skill text after the independent review, same setup):

| Arm | Run 1 | Run 2 | Run 3 | Mean |
|---|---|---|---|---|
| with plugin | 8/9 | **9/9** | 8/9 | 0.93 |
| without | 3/9 | 4/9 | 3/9 | 0.37 |

Δ +0.56 over 6 runs. The two misses were one split vote on "one accent, one family" and one run that did not name what it removed in the reduction pass. The baseline never stated a depth or anti-principles, never gave contrast numbers, and never said whether the page was rendered. Read with the usual caveat: several assertions grade the skill against its own rules, and Sonnet trigger variance is real; the number to watch is the gap, not the absolute.

## v0.2 vs v0.1 — 2026-10-28

Executor: Claude Sonnet subagents, one run per configuration. Grader: Claude Opus, assertions in `evals/cases/`. Directional only.

| Case | v0.2 | v0.1 |
|---|---|---|
| vague-premium-brief (design-core) | 6/6 | 4/6 |
| printable-desk-robot (3d-object-design) | 7/7 | 5/7 |
| rapid-404-page (software-design) | 7/7 | 5/7 |
| **Pass rate** | **100%** | **70%** |
| Avg tokens / time | 95k / 47 s | 90k / 43 s |

**What actually changed in behaviour**
- Specialist runs now produce a hypothesis user panel and DNA with anti-principles (v0.1's 3D run skipped both because the specialist skill never pointed to design-core).
- Quick requests stay quick but keep a compact DNA; the 404 run also caught that the server must return a real 404 status.
- Clarifying questions capped at 3 with stated assumptions (v0.1 asked 6).

**Caveats**
- Several assertions encode rules introduced in v0.2, so part of the gain is the new skill graded against its own rules. Checks that both versions passed (style restraint, numeric FDM rules, contrast, reduced motion) show v0.1 was already strong on Sonnet.
- The vague-brief answer grew ~25% (2,033 vs 1,638 words). Watch length on open-ended briefs.
