# AI Usage Documentation

## 1. Tools Used

* Claude (Anthropic)

Used for:

* Architecture ideation
* Edge case identification
* Initial code scaffolding

---

## 2. Prompts

### Architecture

"Design a backend system for a modular question-based conversation flow using a state machine model."

### Edge Cases

* Handling stale deep links
* Checkpoint logic design
* Broken reference handling

### Navigation

* Go-back behavior with checkpoints

---

## 3. Modifications

* Replaced embedded history with separate `History` collection
* Converted checkpoint flag → `checkpointQuestionIds[]`
* Structured answer flow into clear steps
* Added validation for missing `userId`
* Corrected HTTP status codes
* Added test-safe server guard

---

## 4. Corrections to AI Output

* Prevented deletion of history
* Added fallback for broken references
* Removed debug routes
* Fixed missing test guard

---

## 5. Verification

* Manual API testing (Postman)
* Edge case validation:

  * invalid input
  * stale links
  * checkpoint behavior
  * module switching
* Automated test suite

---

## 6. Summary

AI was used as a **supporting tool**, while all architectural and correctness decisions were:

* validated independently
* modified for scalability
* aligned with requirements
