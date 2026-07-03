# TurnTogether — Office Hours Discovery Session

**Date:** 2026-07-03
**Format:** YC-style office hours, startup mode, run deliberately blank-slate (no prior repo context used in questioning)
**Participant:** Co-founder (the book club member of the founding pair)
**Founding team:** 2 people, ~10 hrs/week combined

---

## The One-Liner

> **TurnTogether makes the reading month visible and shared, so more of the club arrives finished — and the ones who aren't come anyway, because they can engage exactly up to where they've read, spoiler-safe.**

The original pitch ("track the reading progress of book club members") led with the feature. The evidence gathered in this session says tracking is the mechanism; the product is **meeting night at full strength**.

## North-Star Metric

**Finished-and-present:** of a club's members, how many are in the room on meeting night having read the whole book.

Baseline from the founder's own club (13 members, last cycle, book: *Yesteryear*): 8 attended, 6 of those finished. **6 of 13 got the full experience the month was building toward.**

---

## The Problem, As Evidenced

All evidence below comes from the founder's own club — a real, healthy, 13-person club that meets the second Tuesday of each month.

1. **Falling behind is chronic, not occasional.** In the founder's words: a meeting where *everyone* finished is the unusual one.
2. **The expensive failure is the skip.** Members sometimes stay home *because* they're behind and don't want the ending spoiled. Confirmed directly. Attendance is the lifeblood of a club; every skip loosens someone's tie to the group.
3. **The half-loss is the mute.** The founder's own story: went to the *Yesteryear* meeting unfinished (for the friends — correct instinct), then sat out the discussion the whole month had been building toward.
4. **The club already runs this product manually.** The group chat is active a couple of days a week, and members periodically text *"has anybody finished?"* — the app's core query, performed by hand. This is the strongest demand signal in the session: the behavior exists; the tooling is bad.
5. **The group chat structurally cannot host book talk.** Thirteen people at different pages means any substantive message risks spoiling someone — so mid-month book life is compressed into the single always-safe question above. The medium is the bottleneck, not (necessarily) the appetite. *Competing explanation to test: the club may simply prefer saving discussion for Tuesday. The assignment below settles this.*

## Key Insights (from the founder's answers)

| # | Insight | Consequence |
|---|---------|-------------|
| 1 | The club has a **no-guilt culture** — unfinished members say so honestly and are welcome | No shame mechanics, no nagging, no leaderboards. Motivation must be ambient: seeing the pace creates a quiet pull. An app that scolds gets rejected |
| 2 | **Formats are chaos:** physical, ebook, library copies, audiobooks — an audiobook has no page 174 | **Chapters are the universal unit** — of progress ("finished ch. 12") and of spoiler-gating (you see conversation only up to your chapter) |
| 3 | **Rotating host:** each month one member signs up — picks the book, picks the venue, googles discussion questions, leads the night | The host is the adoption vector ("this month we're trying something") and the first user to serve. Question-finding is a real monthly chore the app can delete. Rotation onboards the whole club within a year |
| 4 | The founder — motivated enough to design an app — **never once searched for one** | This market doesn't search. Distribution is member-to-member: apps don't join book clubs, members bring them. App-store presence wins nothing |
| 5 | The club **collectively spends $0** (self-bought books, split checks, voluntary host snacks) | The app must be free for a club — one member hitting a paywall kills group adoption |
| 6 | Desired cadence (founder's own words): checked **"every couple of days"** | Honest and right-sized. Design for that rhythm, not fake daily streaks |

## Design Principles

1. **The app is the servant of the second Tuesday.** It never competes with the meeting; it exists so everyone arrives finished, unspoiled, with things to say.
2. **Chapters, never pages.** The only progress unit all formats share.
3. **Spoiler-safe by construction.** Progress-gated conversation is the one thing a group text can never do — it's the reason to exist.
4. **Ambient motivation only.** Show the pace; never nag. The club solved guilt with friendship already.
5. **Host-first.** Serve the person who owns the month; the club follows the host.
6. **Free for the club.** Monetization is parked deliberately (see risks).
7. **The mix with jobs assigned:** curiosity opens the app (togetherness + anticipation); keeping pace is the byproduct (motivation).

## Honest Risks (recorded in bold, not hand-waved)

1. **Revenue is the weakest leg.** No collective club spend exists to tap. Parked candidates, in order of alignment: (a) the club procures a new book every month on a deadline — a "next book" flow can route purchases via bookshop referrals with zero behavior change; (b) premium host tools, much later. Ruled out: charging 13 friends monthly to see page numbers.
2. **Mid-month appetite is unproven.** "No true discussions between meetings" may mean the medium blocks it — or that nobody wants it. The assignment tests exactly this before any build.
3. **Group adoption is the hard part.** The product only works if most of a 13-person club installs it. Host rotation is the vector; it is still unproven.
4. **Market beyond warm clubs is unknown.** Everything here is n=1 club. Deliberately deferred until club #1 is won.
5. **The shelf is not empty.** Competitor homework (one evening, before building): Goodreads groups, Fable, Bookclubs.com, StoryGraph buddy reads. Notable: none has ever been mentioned inside the founder's highly-target-market club — these products demonstrably don't spread through clubs.
6. **Empty-room risk.** Any chat/forum surface in a 13-person club can look dead. Prefer structures where progress events themselves create the moments, rather than blank walls waiting for posts.

## Distribution Map

- **Club #1:** the founder's own (13 members, meets 2026-07-14). Win this one completely before touching #2.
- **Clubs #2–4:** three known contacts, each in their own club. The realistic next step — carried in by a member, never by marketing.
- **Beyond:** deliberately out of scope until clubs 1–4 teach us something.

## Capacity & Scope Law

Two builders, ~10 combined hours/week. Therefore: **nothing gets built until the assignment reports back.** The MVP scoping session happens after — and must fit a 6–8 week horizon at this capacity.

---

## The Assignment (pre-registered, $0, zero build-hours)

**"Run TurnTogether by hand, and count."**

### Phase 1 — the pace ping (early next week, ~July 6–7)
Text the club group chat, casually, in your own words:
> "Chapter check 📖 — where's everyone at in [current book]? I just hit chapter __."

Then do nothing and watch for 48 hours. Record:
- How many of the 13 reply with a position
- Any reply with *emotional* content — anticipation ("wait till you get to ch. 9"), spoiler-dodging, "hurry up so we can talk about it"
- Anyone reciprocating with their own check later, unprompted

**Pre-registered thresholds:** ≥6 replies = strong pull. 3–5 = promising. ≤2 = red flag on mid-month appetite — and note we're late in the cycle, which *inflates* response, so treat even this read as generous.

### Phase 2 — meeting-night census (July 14)
Learn naturally (the club is honest about this): of 13 — how many attended, how many finished, how many stayed home *because* they were behind. Also: **who hosts August** — that person is the first candidate "host user."

### Phase 3 — only if Phase 1 scored ≥3: one full manual cycle
For the next book (with the August host's blessing): post a chapter check twice a week; keep a simple tally. Watch for: response decay week over week, anyone initiating checks themselves, actual book talk emerging. If by mid-cycle people *await* the check — that's the green light to spend the 10 hrs/week building. If it decays to silence by week two, the app version — which adds install friction — would have died harder.

### Kill / continue criteria
- Phase 1 ≤2 **and** Phase 3 decay → do not build this as a startup. (It may still be a lovely fun project — see D1: ambition levels are allowed to change honestly.)
- Phase 1 ≥3 **and** Phase 3 holds or grows → proceed to MVP scoping session with real evidence in hand.

**Report back with the tallies. The next session scopes the build.**

---

## Deliberately Not Decided

- Platform ("mobile app" was the founder's instinct; the format should follow the evidence, not precede it)
- Feature list (scoping happens only after the assignment reports)
- Name, brand, pricing

## Endnote for the Repo

This session was run blank-slate at the founders' request: questions drew only on the participant's answers, with no reference to prior work in this repository. Mapping these conclusions against the existing February 2026 MVP — where they converge, where they diverge — is a separate and worthwhile exercise, best done after the assignment reports back.
