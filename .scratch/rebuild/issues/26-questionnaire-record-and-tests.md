# Questionnaire record and test rule

Type: grilling
Mode: HITL
Track: Questionnaires
Status: open
Blocked by: 09, 12
Waits on: [How the KarmaYoga Scale and Dosha Survey work now](09-current-questionnaire-behaviour.md), [Questionnaire flow and results page](12-questionnaire-flow-prototype.md)
Map: [Care4Mind.org rebuild](../map.md)

## Question

What must each Questionnaire's record contain, and how do FR-05's tests get their expected results?

**The record's fields**

- items, options, per-option scores and reverse keying
- how scores combine and round
- result bands with inclusive bounds, and tie handling
- result texts, purpose, limitations, version, validation status and source

**The test rule**

- Tests get their expected outcomes from a second source, not from the file the scoring code reads. Examples: a hand-worked table signed off by the Psychology expert, or one checked against the current behaviour.
- Say what "every possible result" means for a percentage. One point per keyed answer on 45 items gives 46 values.
- Say what it means for a category result.

The record defines fields only. Each Questionnaire's values come from its documented scoring or from the Psychology expert, never from the developer.
