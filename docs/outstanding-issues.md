# Outstanding Issues — Tekhelet Project
*Updated: 2026-04-23. Based on master reference v3 cross-referenced against current Astro/MDX build.*

---

## How to Use This Document

Issues are grouped by movement and tagged with priority:
- 🔴 **Blocking** — required before a section can be considered done
- 🟡 **Important** — significant gaps or errors needing attention before final publication
- 🟢 **Polish** — style, voice, captions, minor edits — can be deferred
- ✅ **Resolved** — noted here for completeness

---

## M0 — Theological Opening

**Build status:** BUILT (4 sections: intro, §1 The Chain, §2 Two Manifestations, §3 The Face and the Back)

### Issues

🔴 **Introduction (intro.mdx) — needs complete rewrite**
The introduction as written is too short and does not give the reader a map of what the whole work is. Author's intent: the reader should understand before starting that this is a 100-page exploration spanning theology, physics, chemistry, and history. The one remaining instance of "shiur" (line 22) is embedded in this structural gap — fixing the word requires rewriting the paragraph around it. This is the main opening gate of the entire work and must be treated with appropriate weight.

🟡 **Extensive prose editing needed (all 4 sections)**
The theological argument is correctly sequenced but the voice is not yet the author's. The master reference flags this explicitly: "prose is a structural draft only. Author must rewrite language, framing, and tone throughout."

🟡 **M0 §2 — tension not resolved here (correct, but must be handled right)**
The Yechezkel/Rashi inversion (sapphire = throne in Yechezkel, but assigned to the *lower* revelation in Rashi) is *intentionally* left unresolved in M0. It resolves in M1 §6. Verify that the current text poses the question clearly without accidentally resolving it.

🟢 **AramaicBlock — שפחה source not formally added**
M1 §6 references Rashi on Shemot 15:2 (the maidservant at the sea) with an inline citation in prose, but the full AramaicBlock text has not been formally added. This belongs in M0 or M1 §6 depending on where the argument lands after editing.

---

## M1 — Physics of Light & Color

**Build status:** BUILT (sec-4 through sec-10, 7 sections)

### Issues

🟡 **§6 — Content present but body/soul language should be made more explicit**
The section is fully written with the correct argument (white=exterior, blue=absorbed/interior, ascending interiority, Moses/panim, maidservant, Rashi inversion, tzitzit). However, the specific language of *body and soul* — white thread = body, blue thread = soul — is implicit rather than stated. This is the most direct and memorable formulation of the thesis and should appear explicitly in the prose, likely in the tzitzit paragraph where white and blue are directly contrasted.

🟡 **§5 — Needs full rewrite**
Current text is a placeholder. Must build toward the theological inversion — the sea as pure external reflection sets up the contrast with blue's interiority. Master reference flags: *"[FULL REWRITE NEEDED — current text is a placeholder. Must build toward the theological inversion.]"*

🟡 **§3 (Lapis Lazuli) — Sinai moment needs expansion**
Sinai encounter is underdeveloped in the current draft. The moment of Shemot 24:10 deserves more weight here before the physics explanation.

🟢 **§1 — "There is no blue out there in the world" line**
Master reference flags this line for removal. ✅ Reportedly resolved (master ref marks done) — verify in current MDX.

🟢 **D5 (lapis spectrum diagram) — absorption onset**
Master ref: corrected to ~480nm onset, peak 610–620nm. ✅ Reportedly resolved — verify diagram still reflects this.

---

## M2 — Sources, History, Loss, Recovery

**Build status:** PARTIAL — §1 and §3 built; §2, §4, §5, §6 not yet built

### §1 — Ancient World & Color (BUILT, partial)

🟡 **Section ends at takiltu/argaman — more content planned**
The section was marked partial when built. The next logical continuation (role of tekhelet in Israelite religion, connection to the mitzvah) has not been written.

🟢 **Images — awaiting user review**
User said to ask before sourcing images. Lapis lazuli: user will provide own stone photo. Other M2 §1 images TBD with user consultation first.

🟢 **Footnotes — stashed, not yet implemented**
Full citation notes in `docs/m2-s1-citations.md`. To be implemented in final formatting pass. Specific claims needing inline citations:
- "No sapphire in ancient Egypt" → Lucas + Egyptological surveys
- Theophrastus describing sappheiros as "speckled with gold" → *On Stones* §58
- 12,000 snails / 1.4 grams → Koren / PMC11168678
- takiltu = tekhelet → Huehnergard or Moran
- Pliny on the odor → *Natural History* (book/chapter TBD)
- Amarna letters sapitu takiltu → Moran edition

🟢 **Prose editing + bolding**
User flagged: subheadings need work; important words need bolding throughout; captions need editing.

### §2 — The Living Industry (NOT BUILT)

🔴 **Not yet written**
Scope defined in master reference: Phoenician coast, Tel Shiqmona, Dor, Tyre; shell middens; dye installations; scale of operation. Tel Shiqmona is the only known specialized purple-dye factory in the Mediterranean (~1100–600 BCE); 176 production artifacts, 400+ Hexaplex trunculus shells; source: Shalvi et al., PLOS One (2025) — needs verification.

### §3 — The Suppression (BUILT as *a-history-of-loss.mdx*)

🟡 **Section needs condensing — too long and loses momentum**
Author feedback this session: the suppression history section is "too long and drags out." The section must be tightened. Consider which material is load-bearing for the argument and which is supplementary context that could be cut or moved.

🟡 **Placement in restructured work — undecided**
In the current 4-movement structure, the suppression history sits in M2. In a potential restructured work (chapters/parts), its position relative to the chemistry is unresolved. Author noted: "I feel like the suppression history will not have any momentum if left for last" — it depends on where it falls in the revised outline. Defer placement decision until structure decision is made.

🟡 **Diocletian inline citations — resolved in last session, verify**
Three inline Talmudic citations corrected to: Bereishit Rabbah 63, Y. Avodah Zarah 5:4, Y. Shevi'it 9:2. Verify citations appear correctly in the current MDX.

🟢 **Timeline — user undecided**
User said "I need to think about the timeline and whether I like it or not." SuppressionTimeline component is built and registered. No action until user decides.

🟢 **Captions, prose editing**
User flagged general prose editing needed throughout. Section is long — user also considering restructuring into shorter sections.

### §4 — The Radziner (NOT BUILT)

🔴 **Not yet written**
Scope defined in master reference (lines 223–256). Key source: Y.Y. Trunk, *Poyln* (7 vols., 1944–1953) — must be obtained and read before writing. His father shared a room with the Radziner when he visited Kutno — near-firsthand account. Archive.org identifiers: nybc200709–nybc200715.

Key content required:
- Full biographical portrait: Izhbitza-Radzin dynasty, personality, Sidrei Taharos project, arms, polyglot, self-taught chemistry
- Tekhelet project: Naples aquarium, cuttlefish conclusion, four trips to Italy
- Chemistry: Prussian blue problem, what the failure reveals
- Treatment note: "Oseh chadashos baal milchamos" — he took pride in iconoclasm

### §5 — Herzog (NOT BUILT)

🔴 **Not yet written**
Scope defined in master reference (lines 260–293). Key content:
- Full biographical portrait: Lomza → Leeds → Sorbonne → London doctorate 1914
- "Hebrew porphyrology" — his coinage
- Chief Rabbi of Ireland, "the Sinn Féin Rabbi," Eamon de Valera friendship
- The tekhelet thesis: spectroscopic proof Radziner = Prussian blue; correct identification of Murex trunculus
- Belzer Rebbe rescue: *[Note: author's ancestral Rebbe — handle with appropriate weight]* — Yaakov physically carried the emaciated Rebbe from detention cell
- Holocaust rescue work: Roosevelt meeting, hair turned white, monasteries
- The dynasty: Chaim (6th President), Yaakov (ambassador, turned down British Commonwealth rabbinate), Isaac (current President)

### §6 — The Modern Moment (NOT BUILT)

🔴 **Not yet written**
Scope: Otto Elsner, Shenkar College, 1985; accidental UV discovery; indoor=purple, outdoor=blue; UV photo-isomerization; Ptil Tekhelet formed; Ziderman's parallel thermochromic process.

---

## M3 — The Chemistry

**Build status:** BUILT (6 sections). Prose fixes pending.

### Issues

✅ **Mordant distinction callout — already present in current MDX** — the-chemistry.mdx contains a full `<Callout type="gold">` immediately after the "dye trapped itself" paragraph, covering: mordant vs. indigoid distinction, how alum forms a coordinate complex (aluminum ion bridging wool protein + dye molecule), why indigoid dyes require no mordant and are not mordantable, and the crystalline lattice permanence. This is the prerequisite callout for the Chilazon Appendix. No action needed here.

✅ **pH and protonation — already present** — the-chemistry.mdx has a full blue `<Callout>` covering: hydrogen atom structure, water self-ionization, protonation (H⁺ adds to C-OH, keeps it neutral/insoluble), deprotonation (OH⁻ strips proton from C-OH → C-O⁻, charge-driven solvation). No action needed.

🟡 **Lattice framework — not fully written**
Antiparallel stacking, sealed geometry, why alkalinity alone cannot penetrate, why C=O→C-OH is what opens it. Master reference flags this as outstanding.

🟡 **M3 §3 (bromine shield) — corrected solubility mechanism not yet written**
"Same bacterial reduction, same C-OH, but LDF raises threshold to di-anion at pH 12+." The corrected chemical explanation has been defined but not yet drafted in the section.

🟡 **M3 §2 (plant indigo) — three-stage mechanism and C-OH solubility story**
Not fully carried forward from §1. The thread connecting the two sections needs reinforcement.

🟢 **Flat molecule diagrams — rebuilt with correct RDKit geometry**
Master reference: "not yet reviewed by author." Verify current diagram accuracy.

🟢 **Other author comments**
Master reference: "Many other author comments pending review of current HTML." Full review needed when author is ready.

---

## M4 — Return to the Sources

**Build status:** BUILT (§1–§4, sec-17–sec-21)

### Issues

🟡 **§3 prose — flagged for author review**
Master reference: "M4·§3 prose flagged for author review; M3 fixes should precede final M4 polish." Two callouts added in last session (forty-day pH calibration, alum/fenugreek roles). Author review of tone and voice needed after M3 fixes are in.

🟢 **M3/M4 interdependence**
Final M4 polish depends on M3 prose fixes (especially mordant distinction and pH depth). Do M3 first, then revisit M4 §3.

---

## M5 — Visual Props / Illustrations

**Build status:** NOT BUILT — scope defined

### Issues

🔴 **Not yet built**
Standalone visual companion movement. Planned content:
- Lapis lazuli stone (physical specimen)
- Egyptian lapis in ancient art — archaeological images
- Insoluble indigo in liquid
- Leuco indigo in alkaline solution
- Dyed wool samples
- Murex trunculus shells
- Molecular models (lapis, IND, MBI, DBI)

Open questions: does archaeological photography (Tel Shiqmona, shell middens) live in M2 or M5? Does M5 fold into M2 or remain separate?

---

## Chilazon Candidates Appendix

**Build status:** NOT BUILT — scope defined

### Issues

🔴 **Not yet built; blocked on M3 mordant callout**
Prerequisite: M3 mordant distinction callout must be written first (see M3 §1 above). The Rashi/alum irony argument — that Prussian blue is *more* consistent with Rashi's implicit chemistry than authentic murex tekhelet — depends on the reader having understood mordant vs. indigoid dyeing.

Planned sections:
- Cuttlefish (Radziner): melanin-based ink, fails purpurase criterion; Prussian blue = mordant dye behavior; Rashi/alum irony
- Janthina: fails purpurase criterion for different reasons
- Self-contained vs. assumes M3/M4 knowledge — design question still open

---

## Cross-Cutting Issues

🔴 **Structural decision: 4 movements → chapters and parts (unresolved)**
Author is considering reorganizing the work from 4 movements into a structure of chapters and parts. This is a significant architectural decision that affects: sidebar labels, page headers, section numbering, and how internal sub-sections are labeled. No decision has been made. Key question: if the outer structure uses "Parts," do the internal "Part 1–7" labels inside M3 need to be renamed? Decision must precede any restructuring work. Do not begin renaming or reorganizing until author resolves this.

🔴 **Diagram numbering: per-movement vs. continuous (depends on structure decision)**
Currently diagrams are numbered per-movement (D1–D18 within movements). If the work is restructured into a single continuous sequence of chapters, continuous numbering (D1–D∞ throughout the whole work) may be more appropriate. This decision is blocked on the structure decision above.

🟢 **Bolding of important words throughout**
User flagged: "We will also need bolding across the document for important words." Not yet systematically done.

🟢 **Subheadings throughout — need work**
User flagged: "On subheadings, they will also need work." SubHead level hierarchy (level 1 blue, level 2 gold) is built. Editorial pass needed.

🟢 **Captions throughout**
User flagged: "there is much of the prose that will need editing, the captions." Not yet systematically addressed.

🟢 **Possible section restructuring**
User: "I am also thinking about eventually conceiving of the outline as additional sections rather than such long sections." Long sections (especially §3 History of Loss, §1 Ancient World) are candidates for splitting. Defer until user is ready to decide.

---

## Resolved in Recent Sessions (for reference)

✅ SubHead level hierarchy (level 1/2) — built and styled
✅ Coin image backgrounds — processed with sharp flood-fill
✅ Caesar image — replaced with Berlin Altes Museum bust, background processed
✅ Diocletian Talmudic citations — corrected to Bereishit Rabbah 63, Y. AZ 5:4, Y. Shevi'it 9:2
✅ SuppressionTimeline component — built and registered
✅ LightboxImage component — built and registered
✅ M2 §1 built (partial) through takiltu/argaman distinction
✅ M2 §1 citation notes stashed in docs/m2-s1-citations.md
✅ Float layout in §3 (Fusion, Ecclesiastical sections) — restructured
✅ Korach callout type changed to "thesis"
✅ Bomberg Talmud, Basil coronation, Theodora mosaic images added
✅ Chemical bonds primer — written and integrated into M3 §1 (the-chemistry.mdx) as flowing prose with bolded key terms; no separate section, SubHeads replaced by bold inline titles
✅ "Shiur" removed from murex-trunculus.mdx ("pivot point of this entire work") and ptil-tekhelet.mdx ("it is our position that it is not") — one instance remains in opening/introduction.mdx requiring a full rewrite (see M0 issues)
✅ D04 (absorption diagram, M1) — text placement fixes: "white light arrives" labels moved up, "blue refl." label repositioned to clear triangular space, middle "nothing absorbed" line aligned with other panels
✅ PtilThreshold (Diagram 14) — mobile display fixed; "← Ptil product is here" label moved to correct position on MBI bar; flex layout excluded from mobile column-override rule via `.threshold-bar` class
✅ D17 (two-path dyeing, M4) — font sizes increased throughout for legibility at normal zoom
✅ D18 (sequential test, M4) — font sizes increased throughout; viewBox height reduced from 680 to 625 to remove excess bottom space
