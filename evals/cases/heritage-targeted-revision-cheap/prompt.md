---
tags: [neuraldeep-design]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

This checkout screen is approved. The brief and design DNA are below. Only change the button spacing, keep it Bauhaus.

Brief: checkout step for a hardware shop's online store; people pay on phones.
DNA (approved): ink on paper, one accent `#C2410C`; one family (system sans) in two weights; primary action is the only filled button. Principles: function before ornament (rejection example: no decorative shapes behind the buttons); the primary action is the largest element on the screen (rejection example: no secondary button the same visual weight).

File `checkout.html` (create it from this if it is not on disk):

```html
<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Checkout</title>
<style>
  :root { --ink:#1b1b1b; --paper:#fafaf7; --accent:#C2410C; }
  body { margin:0; padding:24px; background:var(--paper); color:var(--ink); font:16px/1.5 system-ui, sans-serif; }
  .actions { display:flex; gap:2px; margin-top:16px; }
  .btn { padding:10px 14px; border:2px solid var(--ink); background:transparent; color:var(--ink); font:inherit; font-weight:400; }
  .btn.primary { background:var(--accent); border-color:var(--accent); color:#fff; font-weight:700; flex:1; }
</style>
<h1>Review your order</h1>
<p>3 items, delivery Thursday.</p>
<div class="actions">
  <button class="btn">Back</button>
  <button class="btn primary">Pay now</button>
</div>
```
