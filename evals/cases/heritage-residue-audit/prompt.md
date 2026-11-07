---
tags: [neuraldeep-design]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

Audit this CSS against a declared set. Unit: 4 px, applied to every spacing and sizing value (padding, margin, gap, width, height, line-height) except font-size. 44 px is a platform touch-target minimum, so treat it as exempt. Type: a 1.25 scale from a 16 px base, checked on font-size only, with each value compared to the unrounded step within 0.5 px. List the outliers with the measured residue and say whether each needs a function or a fix. Also tell me whether switching the unit to 8 px would change the list.

```css
.card { padding: 15px 22px; margin-bottom: 30px; gap: 12px; }
.card h2 { font-size: 25px; line-height: 32px; margin: 0 0 17px; }
.card p { font-size: 16px; line-height: 24px; max-width: 480px; }
.btn { min-height: 44px; padding: 0 16px; font-size: 18px; }
.badge { font-size: 13px; padding: 4px 8px; }
.hero h1 { font-size: 34px; line-height: 40px; }
.hero .lede { font-size: 20px; }
.stat { font-size: 31px; }
```
