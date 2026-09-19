🎙️ AnchorFlow

An AI-powered event operations platform that keeps organizers and anchors synchronized when a live event changes.

📌 Overview

College events require anchors and organizers to coordinate schedules, speaker introductions, transitions, announcements, and delays in real time. These details are often spread across printed schedules and group chats, so one unexpected change can create confusion on stage.

AnchorFlow creates a single, shared source of truth through two focused interfaces:

Organizer Dashboard: Manage the event, agenda, speakers, scripts, delays, and announcements.

Anchor Dashboard: View the current activity, an anchor-ready script, a countdown, and the next activity.

When an organizer reports a delay, AnchorFlow recalculates the schedule, generates an appropriate filler or transition script, and sends the update to the anchor without requiring a page refresh.

🔄 Core Workflow

flowchart TD
    A["Create event"] --> B["Add agenda and speakers"]
    B --> C["Generate scripts with AI"]
    C --> D["Start Live Mode"]
    D --> E["Organizer reports a delay"]
    E --> F["Recalculate schedule"]
    F --> G["Generate recovery script"]
    G --> H["Update Anchor Dashboard"]

✨ Features

Organizer Dashboard

-Create and manage events, speakers, guests, and agenda items

-Reorder or retime activities

-Generate, review, edit, and regenerate scripts

-Start, pause, advance, and end a live event

-Report delays and publish unexpected announcements

-Mark speakers as arrived and notify the anchor

Anchor Dashboard

-Large, distraction-free script card

-Current activity countdown

-Preview of the next activity

-Automatic schedule and announcement updates

-Simple Mark Done / Next control

-Adjustable font size and light/dark display modes


**AI Script Generation
**
AnchorFlow uses event details, agenda context, speaker biographies, event tone, and live schedule status to generate:

-Opening scripts

-Speaker introductions

-Activity introductions

-Transition scripts

-Delay filler scripts

-Unexpected announcements

-Closing scripts

**Live Schedule Recovery
**
The scheduling engine performs time calculations using deterministic backend logic. AI generates the language used on stage and can suggest a recovery strategy, while the backend applies bounded and predictable schedule changes.

For example, if a speaker is delayed by 20 minutes, AnchorFlow can use available buffer time, adjust later activities, generate a short audience-engagement script, and immediately update the anchor's screen.

🌟 Standout Features

**One-Tap Recovery Cards
**
Pre-generated contingency scripts provide an immediate response for situations such as short delays, cancellations, or technical difficulties. A freshly generated script can replace the cached version when it becomes available.

**Vibe Meter
**
Organizers or audience volunteers can submit simple crowd-energy signals. When engagement drops, AnchorFlow can suggest a short, context-aware line to help the anchor re-engage the room.

🏗️ How It Works

Both dashboards use a shared LiveEventState. The organizer controls the event flow, while the anchor receives the latest script, timing, and activity information. Socket.IO provides live updates, with polling available as a fallback.

flowchart LR
    O["Organizer Dashboard"] -->|Controls and updates| API["Backend API"]
    API --> DB["SQLite database"]
    API --> AI["AI script generator"]
    DB --> LIVE["Live event state"]
    AI --> LIVE
    LIVE -->|Socket.IO / polling| A["Anchor Dashboard"]

🛠️ Tech Stack

-Frontend

React, Vite, Tailwind CSS

-Backend

Node.js

-Database

SQLite, Prisma ORM

-Real-time updates

Socket.IO with polling fallback

-AI

Configurable LLM API


Open a pull request describing what changed and how it was verified.
