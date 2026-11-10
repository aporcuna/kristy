# Kristy's Garage Auction App – Requirements Notes

**Document type:** High-level client notes (input for Business Analysis)
**Purpose:** Basis for creating Jira Epics and tickets
**Version:** 1.4 – all questions and assumptions resolved; ready for Business Analysis (2026-11-09)
**Status:** Proof of concept – fictional project, not intended for production

---

## 1. Project Overview

A web app to run small garage auctions of toys on a big screen. An **auction** is made up of one or more **toys** (also called "lots" internally). The auctioneer (Kristy) shows each toy on screen, takes bids from bidders and marks toys as sold.

> **Terminology rule:** "Lot" may be used in internal documentation, but the **frontend and screen must always say "Toy"**.

### 1.1 Scope summary
- Manage toys (catalogue), including photo upload.
- Manage bidders (participants).
- Create an auction from a selection of toys.
- Run the auction on a big screen: navigate toys, place bids, sell toys, close the auction.

### 1.2 Out of scope
- Production deployment, real users, authentication or payments.
- Concurrency: there is **only one active session** at a time.
- History of auctions: **only the current auction exists**. No records of past auctions are kept, and there is no auction list screen.
- Sold summary / end-of-auction report.

---

## 2. Personas

| Persona | Role | Interaction with the app |
|---|---|---|
| **Kristy** | Teenager, owner of the toys, the **auctioneer** | Manages bidders, creates the auction, runs the auction screen (main user) |
| **Grandma** | Supplies new toys to Kristy | Only creates toys in the catalogue |
| **Developer** | Builds the app | Infrastructure and non-functional requirements |
| **Lisa, Tony, Martha (and other bidders)** | Kristy's friends | Auction **bidders**; randomly assigned to bids and shown on screen |

---

## 3. Technical Constraints & Non-Functional Requirements

| Area | Requirement |
|---|---|
| Language | TypeScript (frontend and backend) |
| Backend | Node.js |
| Frontend | React |
| Architecture | **Feature-based pods** folder structure (e.g. `toys`, `bidders`, `auction` pods, each holding its own components, services, types and tests) |
| UI components | Atomic Design (atoms, molecules, organisms, templates, pages) |
| Data | Mocked internally in a small database or JSON files |
| Volume | 20–30 toys maximum; no performance concerns |
| Sessions | Single active session; no concurrency handling required |
| Images | Uploaded from device; displayed in a **400×300** frame, **fitted with margins** (no cropping, aspect ratio preserved) |
| Display | Optimised for a big screen (TV/projector) |
| Look & feel | Teen-girl style using soft **pastel tones**, not bright colours |
| Language of project | English (code, docs, tickets, UI) |
| Story format | Gherkin – *As a… / I want… / So that…* |

---

## 4. Navigation

| Screen | Description | Access |
|---|---|---|
| **Toy list** | **Landing screen.** Toy CRUD and toy selection (checkboxes) to create an auction | App start; `Close auction` button |
| **Bidder list** | Bidder CRUD | From the toy list (navigation menu) |
| **Auction screen** | Runs the current auction | After `Create auction` |

---

## 5. Data Model (draft)

**Toy**
- `id`
- `name` (required)
- `photo` (image, nullable)
- `description`
- `model`
- `startPrice` (€, different for every toy)

**Bidder**
- `id`
- `name` (only field required)

**Auction** (single record – only the current one exists)
- `id`
- `name` (required at creation)
- `toys` – ordered list of auction toys

**Auction Toy (Lot)**
- `toyId`
- `status`: `New` | `Active` | `On hold` | `Sold`
- `nextBidPrice` – price the next bid will commit to (starts at `startPrice`)
- `salePrice` – price committed by the current bidder (null until the first bid)
- `currentBidderId` – bidder holding the current bid (null until the first bid)

---

## 6. Functional Description – Auction Screen

### 6.1 Layout
- **Left panel:** list of all toys in the auction. Each item shows:
  - Toy **name**
  - **Status** (New / Active / On hold / Sold)
  - Toy **image** at a reduced but proportional size (4:3 thumbnail, fitted with margins)
- **Right panel (big frame):** details of the active toy:
  - Photo (400×300 frame, fitted with margins)
  - Name, description, model
  - **Next bid price** (text box) – starts at the toy's start price
  - **Sale price** (label) – price committed by the current bidder
  - **Bidder** (label) – name of the current bidder
- **Buttons:** `Previous`, `Next`, `Bid`, `Sell` (`Sell` placed next to `Bid`), `Close auction`.

### 6.2 Missing image
- If a toy has no image, a frame with the text **"No image available"** is shown instead, both in the detail frame and the left list.

### 6.3 Bidding
- When **Bid** is pressed:
  1. A bidder is assigned at random from the **full bidder list** (Phase 3).
  2. The same bidder **cannot** be picked twice in a row.
  3. **Sale price** = the next bid price shown when Bid was pressed.
  4. **Next bid price** increases by **€10**.

**Example (start price €50)**

| Action | Bidder | Sale price | Next bid price |
|---|---|---|---|
| Toy becomes active | – | – | €50 |
| Bid | Lisa | €50 | €60 |
| Bid | Tony | €60 | €70 |
| Sell | Tony wins | **Sold at €60** | – |

### 6.4 Selling
- **Sell** is only available once at least one bid has been placed. A toy cannot be sold without a bidder.
- The toy is sold to the current bidder at the **sale price**, not the next bid price.
- The toy's status changes to **Sold**.
- The app then **automatically moves to the next toy with status New or On hold**:
  - It searches forward from the sold toy; if it reaches the end of the list, it continues from the beginning.
  - If there are no New or On hold toys left, the screen stays on the sold toy.

### 6.5 Changing the active toy
Applies equally to clicking a toy in the left list and to the **Previous / Next** buttons.
- A confirmation is shown: **"Are you sure to change the active toy?"**
- On confirmation:
  - If the previous active toy **has at least one bid**, it changes to **On hold** and keeps its next bid price, sale price and current bidder.
  - If the previous active toy **has no bids**, it goes back to **New**.
  - The selected toy becomes **Active**. An On hold toy resumes with its kept data.
- On cancel: nothing changes.
- **Previous / Next skip Sold toys**: they move to the previous / next toy with status New or On hold. Sold toys can only be reopened by clicking them in the left list.
- `Previous` / `Next` are disabled when there is no New or On hold toy before / after the current one.

### 6.6 Reopening a Sold toy
- Clicking a Sold toy in the left list shows a confirmation explaining that the toy will be reopened.
- On confirmation the toy becomes **Active** and is **reset**: next bid price = start price, sale price and bidder cleared.

### 6.7 Closing the auction
- **Close auction** asks for confirmation before ending the auction.
- On confirmation the auction ends and the app returns to the **toy list** (landing screen). No records of the auction are kept.
- On cancel: the auction continues unchanged.

### 6.8 Status rules

| Status | Meaning |
|---|---|
| **New** | Toy has no bids and is not active (initial status for all toys) |
| **Active** | Toy currently shown in the detail frame (only one at a time) |
| **On hold** | Toy was active and left unsold with at least one bid; keeps next bid price, sale price and bidder |
| **Sold** | Toy sold to a bidder at the sale price |

| From | Event | To |
|---|---|---|
| New | Selected (list / Previous / Next / auto-advance after Sell) | Active |
| On hold | Selected (list / Previous / Next / auto-advance after Sell) | Active (resumes with kept data) |
| Active (no bids) | Another toy selected + confirmed | New |
| Active (≥1 bid) | Another toy selected + confirmed | On hold |
| Active (≥1 bid) | Sell | Sold (then auto-advance) |
| Sold | Clicked in the left list + reopen confirmed | Active (reset to start price) |

---

## 7. Implementation Phases (proposed Epics)

### Phase 1 – Project Scaffolding ("Hello World")
**Goal:** Frontend and backend exist and communicate.
- React + TypeScript frontend; Node + TypeScript backend.
- Feature-based pods folder structure on both sides; Atomic Design for frontend components.
- Mock data layer (JSON files / small DB) in place.
- Base pastel theme (colour palette, typography) defined so later phases reuse it.
- Shared types (Toy, Bidder, Auction, AuctionToy) between frontend and backend.
- Basic routing with the toy list as the landing screen.

**Stories**
- As a **Developer**, I want a frontend and backend skeleton running locally, so that the team can start building features.
- As a **Developer**, I want a feature-based pods folder structure, so that each feature is self-contained and easy to maintain.
- As a **Developer**, I want a mock data store, so that the app can persist data without a production database.
- As a **Developer**, I want a base pastel theme and atomic component structure, so that all screens look consistent.

### Phase 2 – Toy Management (CRUD)
**Goal:** List, create, edit and delete toys. The toy list is the landing screen.
- Fields: name, photo, description, model, start price.
- Photo uploaded from device and shown in a 400×300 frame, fitted with margins.
- "No image available" frame when there is no photo.
- Seed data: 20–30 mock toys.

**Stories**
- As **Kristy**, I want the toy list to be the first screen when I open the app, so that I can start working straight away.
- As **Grandma**, I want to create a toy with name, photo, description, model and start price, so that Kristy can auction it.
- As **Grandma**, I want to upload the toy photo from my device, so that I don't need an image URL.
- As **Kristy**, I want photos to fit the frame with margins, so that no part of the toy is cut off.
- As **Kristy**, I want to see a "No image available" frame when a toy has no photo, so that the layout stays consistent.
- As **Kristy**, I want to edit a toy, so that I can correct its details or price.
- As **Kristy**, I want to delete a toy, so that toys no longer available do not appear.

### Phase 3 – Bidder Management (CRUD)
**Goal:** Manage the people bidding in auctions. Only the name is required.
- Accessible from the toy list.
- Seed data: **10 initial bidders** – Lisa, Tony, Martha, Emma, Leo, Sofia, Max, Chloe, Noah, Ruby.

**Stories**
- As **Kristy**, I want to add bidders by name, so that they can be assigned bids during the auction.
- As **Kristy**, I want to list, edit and delete bidders, so that the list is up to date.
- As a **Developer**, I want 10 bidders loaded at start-up, so that auctions can be tested straight away.

### Phase 4 – Auction Creation
**Goal:** Build the auction from toys selected in the toy list.
- Checkbox per toy in the toy list.
- `Create auction` button, disabled until at least one toy is selected; requires an auction name.
- All toys in the new auction start as **New**.
- Opens the auction screen once created.

**Stories**
- As **Kristy**, I want to select several toys with checkboxes, so that I can group them into an auction.
- As **Kristy**, I want to press "Create auction" and enter a name, so that the auction starts.

### Phase 5 – Auction Screen (Layout, Navigation & Close)
**Goal:** Show the auction's toys one at a time in the detail frame.
- Opens on the first toy.
- Detail frame: photo, name, description, model, next bid price, sale price label, bidder label.
- `Previous` and `Next` buttons to move through the list, skipping Sold toys.
- `Close auction` button, with confirmation, returns to the toy list; no auction record is kept.

**Stories**
- As **Kristy**, I want the auction screen to open on the first toy, so that I can start the auction straight away.
- As **Kristy**, I want "Previous" and "Next" buttons that skip sold toys, so that I only move through toys still pending.
- As **Kristy**, I want a "Close auction" button with confirmation, so that I can finish the auction and go back to the toy list without closing it by mistake.

### Phase 6 – Auction Toy List & Statuses
**Goal:** Left-side list of the auction's toys with statuses, direct selection and status rules.
- Each item: name, status and proportional thumbnail.
- Statuses: New, Active, On hold, Sold.
- Confirmation "Are you sure to change the active toy?" for list clicks **and** Previous / Next.
- Previous / Next skip Sold toys; Sold toys are reopened only from the left list.
- Leaving an active toy: On hold (with bids, keeping price, sale price and bidder) or New (without bids).

**Stories**
- As **Kristy**, I want to see all the auction's toys on the left with name, image and status, so that I know which are new, active, on hold or sold.
- As **Kristy**, I want to click a toy in the list to make it active, so that I can auction toys in any order.
- As **Kristy**, I want to confirm before changing the active toy, so that I don't change it by mistake.
- As **Kristy**, I want a toy I leave with bids to go On hold with its price, sale price and bidder, so that I can resume its auction later.
- As **Kristy**, I want a toy I leave without bids to go back to New, so that it is clear nobody has bid on it.

### Phase 7 – Bidding & Selling
**Goal:** Place bids, sell toys and reopen sold toys.
- `Bid`: random bidder (never the same twice in a row), sale price set, next bid price +€10. Requires at least 2 bidders.
- `Sell`: only after at least one bid; sold at the sale price; auto-advance to the next New or On hold toy (wrapping to the start of the list).
- Reopening a Sold toy after confirmation resets it to the start price.

**Stories**
- As **Kristy**, I want to press "Bid" to assign a random bidder and raise the next bid price by €10, so that the auction moves forward quickly.
- As **Kristy**, I want the same bidder never to bid twice in a row, so that the auction feels realistic.
- As **Kristy**, I want to see the sale price and the current bidder, so that everyone knows who is winning and at what price.
- As **Kristy**, I want to press "Sell" to sell the toy at the sale price, so that I can close its auction.
- As **Kristy**, I want the app to move automatically to the next pending toy after a sale, so that the auction keeps flowing.
- As **Kristy**, I want to reopen a sold toy after confirming, so that I can restart its auction from the start price.

### Phase 8 – Polish & Big-Screen Readiness (optional)
- Visual review for big-screen readability (font sizes, contrast within the pastel palette).
- End-to-end walkthrough of a full auction with mock data.

---

## 8. Key Acceptance Criteria (Gherkin)

```gherkin
Feature: Bidding on the active toy

  Scenario: First bid on a toy
    Given the active toy has a start price of €50 and no bids
    When Kristy presses "Bid"
    Then a bidder is assigned at random from the bidder list
    And the sale price is €50
    And the next bid price is €60

  Scenario: Same bidder cannot bid twice in a row
    Given Lisa holds the current bid
    When Kristy presses "Bid"
    Then the new bidder is not Lisa

  Scenario: Sell is not available without bids
    Given the active toy has no bids
    Then the "Sell" button is disabled

  Scenario: Sell at the sale price
    Given Tony holds the current bid with a sale price of €60 and a next bid price of €70
    When Kristy presses "Sell"
    Then the toy is sold to Tony for €60
    And the toy status changes to "Sold"
```

```gherkin
Feature: Auto-advance after selling

  Scenario: Move to the next pending toy
    Given the auction toys are "A: Sold", "B: Active", "C: Sold", "D: New"
    When Kristy sells toy B
    Then toy D becomes Active

  Scenario: Wrap to the beginning of the list
    Given the auction toys are "A: On hold", "B: Sold", "C: Active"
    When Kristy sells toy C
    Then toy A becomes Active

  Scenario: No pending toys left
    Given all other auction toys are Sold
    When Kristy sells the active toy
    Then the screen stays on the sold toy
```

```gherkin
Feature: Change the active toy

  Scenario Outline: Leave a toy with bids
    Given a toy is Active with Tony as bidder, a sale price of €60 and a next bid price of €70
    When Kristy <action>
    Then the prompt "Are you sure to change the active toy?" is shown
    When Kristy confirms
    Then the new toy is shown in the detail frame as Active
    And the previous toy is "On hold" with Tony as bidder, a sale price of €60 and a next bid price of €70

    Examples:
      | action                              |
      | clicks a different toy in the list  |
      | presses "Previous"                  |
      | presses "Next"                      |

  Scenario: Leave a toy without bids
    Given a toy is Active with no bids
    When Kristy selects a different toy and confirms
    Then the previous toy status is "New"

  Scenario: Cancel change of active toy
    Given the change prompt is shown
    When Kristy cancels
    Then the active toy does not change

  Scenario: Next skips sold toys
    Given the auction toys are "A: Active", "B: Sold", "C: New"
    When Kristy presses "Next" and confirms
    Then toy C becomes Active

  Scenario: Next disabled when no pending toys ahead
    Given the auction toys are "A: Sold", "B: Active", "C: Sold"
    Then the "Next" button is disabled
    And the "Previous" button is disabled

  Scenario: Reopen a sold toy
    Given a toy is Sold
    When Kristy clicks it in the left list
    Then a confirmation explains that the toy will be reopened
    When Kristy confirms
    Then the toy becomes Active
    And the next bid price equals the start price
    And the sale price and bidder are cleared
```

```gherkin
Feature: Toy images

  Scenario: Toy without image
    Given a toy has no photo
    When the toy is displayed
    Then a frame with the text "No image available" is shown

  Scenario: Image with a different aspect ratio
    Given a toy photo is not 4:3
    When the toy is displayed
    Then the full image is fitted inside the 400x300 frame with margins
```

```gherkin
Feature: Auction lifecycle

  Scenario: Create an auction
    Given Kristy is on the toy list and has selected at least one toy
    When Kristy presses "Create auction" and enters a name
    Then the auction screen opens with the selected toys, all with status "New"

  Scenario: Close the auction
    Given an auction is running
    When Kristy presses "Close auction"
    Then a confirmation is shown
    When Kristy confirms
    Then the toy list is shown
    And no record of the auction is kept

  Scenario: Cancel closing the auction
    Given the close auction confirmation is shown
    When Kristy cancels
    Then the auction continues unchanged
```

---

## 9. Decisions Log

| # | Topic | Decision |
|---|---|---|
| 1 | Architecture | Feature-based pods folder structure |
| 2 | Phase 3 scope | CRUD is for bidders ("create auctioneers" was wrong) |
| 3 | Random bidder source | Full list of bidders from Phase 3; 10 bidders seeded |
| 4 | Repeated bidder | Same bidder cannot bid twice in a row |
| 5 | Leaving an active toy | With bids → "On hold" keeping next bid price, sale price and bidder; without bids → "New" |
| 6 | Previous / Next | Change the active toy, show confirmation, same rules as list click |
| 7 | Reopen Sold toy | Reset to start price |
| 8 | Sell without bids | Not allowed; sold at "sale price", not "next bid price" |
| 9 | After Sell | Auto-advance to next New / On hold toy, wrapping to the start; stay if none left |
| 10 | Auction list | Not needed; only the current auction exists |
| 11 | Close auction | Button returns to the toy list; no records kept; no warning needed when creating a new auction |
| 12 | Toy photos | Uploaded from device; 400×300 frame, fitted with margins; "No image available" frame if null |
| 13 | Toy name | Required; left list shows name, status and proportional image |
| 14 | Sold summary | Not needed |
| 15 | Concurrency | Single active session; no concurrency handling |
| 16 | Landing screen | Toy list |
| 17 | Previous / Next over Sold toys | Skip them; Sold toys are reopened only from the left list |
| 18 | Close auction confirmation | Required |
| 19 | Previous / Next limits | No wrap-around; each is disabled when there is no New or On hold toy in that direction |
| 20 | Minimum bidders | Bidding requires at least 2 bidders (needed by the "no repeated bidder" rule) |
| 21 | Auto-advance confirmation | Auto-advance after Sell does not show the "change active toy" confirmation |
| 22 | Auction creation location | Checkboxes and `Create auction` are on the toy list landing screen |

## 10. Assumptions (to be validated)

None – all assumptions validated by the client.

## 11. Open Questions

None at this stage.

---

## 12. Running the app (Phases 1–5 implemented)

```bash
npm install
npm run dev      # API on http://localhost:3001, web on http://localhost:5173
npm test         # backend unit tests
npm run typecheck
```

Layout: `shared/` (types and pure auction rules), `backend/src/{toys,bidders,auction}` (pods, JSON-file store in `backend/data`, uploads in `backend/uploads`), `frontend/src/{pods,ui}` (pods + atoms/molecules/organisms/templates).
