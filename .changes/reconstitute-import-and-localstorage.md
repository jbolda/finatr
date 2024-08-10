---
'web': patch
---

Fix the thrown errors due to the various ways values were "reconstituting". That is, all cases weren't correctly converting from primitives into a proper `Dinero<number>`. Normalize on a function to handle this across all situations.
