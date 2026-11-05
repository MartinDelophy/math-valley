# Chapters III and IV

Sixteen formal levels extend the existing journey to 44, with stable IDs `3-01`…`3-08` and `4-01`…`4-08`. Each chapter has four acts of two puzzles. The prologue remains separate.

## Mathematical sources

The owner's read-only mathematics notes supplied the topics: **Abstract Algebra**, chapters 3 (subgroups and cosets), 4 (normal subgroups), 5 (homomorphisms) and 6 (group actions); **Information Theory**, chapter 4 (error-correcting codes). The game uses original, finite constructions rather than publishing the source notes.

Background references: [MIT Algebra I notes](https://ocw.mit.edu/courses/res-18-011-algebra-i-student-notes-fall-2021/mit18_701f21_full_lec_new.pdf) and [University of Michigan Hamming/SECDED teaching material](https://www.eecs.umich.edu/courses/eecs373.w05/lecture/hamming.html). Authored transitions and code distances are verified computationally in the repository.

## Court of Symmetry

An element of the order-2n dihedral group is `(k,m)`, represented as `r^k s^m`. Right-multiplication controls append generators to the displayed word. The vertex action is `x ↦ k + (−1)^m x mod n`; thus `(gh)·x = g·(h·x)`. This convention is explicit in the notes.

The two galleries are a geometric representation of the Cayley graph. The marked mirror passages implement `s`; their endpoints lie on a common sightline only in the designated view. A camera rotation never changes the group element. The asymmetric numbered central markers show the actual vertex permutation. Stamps can only be taken from reached elements.

The progression moves from relations and comparing `rs` with `sr` to stabilizers, left-coset transversals, conjugation witnesses and exhaustive action-kernel discovery. The final D₆ puzzle uses `N = ⟨r²⟩`, whose cosets are distinguished by `(k mod 2,m)`, then constructs the nonidentity commutator `rsr⁻¹s = r² ∈ N`. Exhaustive later puzzles require visiting every group element before submitting.

## Echo Beacons

Seven or eight physical towers represent the code coordinates. The first seven columns of H are binary indices 1…7, with rows in least-significant-bit-first order. Parity coordinates are 1, 2, 4 and data coordinates are 3, 5, 6, 7. The eighth coordinate is overall even parity. This ordering is used consistently in the encoder, scene, syndrome, notes and tests.

Rotating to views I–III reveals individual parity channels; IV reveals the overall channel. A beacon can be changed only from its marked view. Known erasures lock the other coordinates; unknown errors have explicit one-error bounds. Repairing a valid signal deploys the physical links between towers.

The distance-three puzzle asks for a weight-three nonzero codeword, while the notes establish the matching lower bound from distinct nonzero H columns. The extended code has distance four. The ambiguity puzzle requires two distinct valid extended codewords at distance two from the same received vector: a constructive certificate against unique double-error correction. It does not claim that a zero syndrome proves no channel errors without assumptions.

## Saves, teaching and audio

Finished actions are persisted. New-engine checkpoints are restored by replaying legal mathematical transitions and checking a rules fingerprint. Existing graph and topology checkpoints retain their original IDs and rules. A real catalog-upgrade test checks that all sixteen additions are announced without replacing a previous journey.

Two independent guided examples teach the new controls without solving a formal puzzle. Notes and controls are localized in all nine supported languages. Audio contains sound effects and the bundled CC0 piano recording only; there is no TTS.

These are playable prototypes. Broader balancing and further native-language proofreading remain useful follow-up work.
