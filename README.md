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

### Qualification Voting (1 Candidate)
Voters choose:
- Yes
- No
- Abstain

---

### Preference Voting (2 Candidates)
Voters select one candidate.

The winner is determined by a weighted vote.

---

### Ranked Choice Voting (3+ Candidates)
Points per voter:
- 1st choice → 3 points
- 2nd choice → 2 points
- 3rd choice → 1 point

Points are aggregated per pool, normalized, and weighted.

---

## Notes

- No absentee voting.
- Abstain votes are excluded from calculations.
