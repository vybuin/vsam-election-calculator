# VSAM Election Calculator
I did not enjoy using spreadsheet :/ so here we are lol

Modern dashboard web app for calculating VSAM yearly weighted election results. This is NOT a public voting app. It is an internal VSAM tool used only after PVP manually collects the votes. This replaces manual spreadsheet-based tallying.

---

## Overview

This tool calculates election outcomes using weighted voting pools:
- Board Members
- Board Alumni
- General Assembly (GA)

Voting methods supported:
- Qualification Voting (1 candidate)
- Preference Voting (2 candidates)
- Ranked Choice Voting (3+ candidates)

---

## Voting Weights

Default distribution:
- Board Members – 55%
- Board Alumni – 15%
- GA – 30%

Weights are editable and must total 100%.

Final Score Formula:

Final Score = Σ (Pool Share × Pool Weight)

---

## Voting Methods
All candidates are listed at the top with editable names (can add/remove candidates)

### Qualification Voting (1 Candidate)
Voters choose:
- Yes
- No
- Abstain

Every candidate goes through qualification voting (requires ≥66.67% weighted approval)

1 qualified candidate: Automatic winner (no Stage 2 needed)

---

### Stage 2: Automatic System Selection - Based on how many candidates qualify:

- 2 qualified candidates: Two-candidate direct vote count system appears
- 3+ qualified candidates: Ranked choice voting system appears with a tiebreaker if needed

---

## Notes

- No absentee voting.
- Abstain votes are excluded from calculations.