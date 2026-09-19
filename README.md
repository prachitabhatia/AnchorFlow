🎙️ AnchorFlow

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Platform Workflow](#-platform-workflow)
- [Contributors](#-contributors)
- [Why AnchorFlow?](#-why-anchorflow)

---

## 🌐 Overview

Live college events involve speakers, activities, announcements, transitions, and strict schedules. When a speaker is late or an activity runs over time, organizers often coordinate through paper schedules and group chats while the anchor improvises on stage.

**AnchorFlow** gives the event team one shared platform to:

1. **Plan** the event agenda and manage speaker information.
2. **Generate** opening, introduction, transition, filler, announcement, and closing scripts with AI.
3. **Run** the event through a synchronized Organizer Dashboard and Anchor Dashboard.
4. **Recover** from delays by recalculating timings and preparing an immediate anchor-ready script.
5. **Track** the current activity, upcoming activity, countdown, and live event status.

---

## ✨ Features

### 🎛️ Organizer Dashboard

- Create and manage events, agenda items, speakers, and guests.
- Reorder activities and update their timings.
- Review, edit, or regenerate AI-created scripts.
- Start, pause, advance, and end a live event.
- Report delays and publish unexpected announcements.
- Mark a speaker as arrived and notify the anchor instantly.

### 🎤 Anchor Dashboard

- Display a large, distraction-free script for the current moment.
- Show the current activity and its live countdown.
- Preview the next scheduled activity.
- Receive schedule changes and announcements automatically.
- Advance the event using a simple **Mark Done / Next** control.
- Support readable font sizes and light/dark viewing modes.

### 🤖 AI Script Generation

AnchorFlow builds every script from the event context, including its tone, agenda, speakers, previous activity, upcoming activity, and current schedule status.

It can generate:

- Opening scripts
- Speaker introductions
- Activity introductions
- Transition scripts
- Delay filler scripts
- Unexpected announcements
- Closing scripts

### ⏱️ Delay-Aware Schedule Recovery

- Accept a delayed activity and the expected delay duration.
- Calculate how much time can be absorbed through available buffers.
- Shift affected agenda items using deterministic backend logic.
- Generate a context-aware filler or transition script.
- Push the new script, countdown, and schedule to the Anchor Dashboard.

### 🛟 One-Tap Recovery Cards

- Pre-generate scripts for short delays, longer delays, cancellations, and technical issues.
- Display a cached script immediately when a live AI request is slow or unavailable.
- Replace it with a newly generated version when available.

### 🔥 Vibe Meter

- Collect simple crowd-energy feedback from organizers or volunteers.
- Track recent audience energy through a live gauge.
- Suggest a brief re-engagement prompt when energy drops.

---

## 🛠 Tech Stack

| Category          | Technology                      |
| ----------------- | ------------------------------- |
| Frontend          | React, Vite                     |
| Styling           | Tailwind CSS                    |
| Backend           | Node.js                         |
| Database          | SQLite                          |
| ORM               | Prisma                          |
| Real-time updates | Socket.IO with polling fallback |
| AI                | Configurable LLM API            |
| Development       | Nodemon                         |
| Version control   | Git and GitHub                  |

---

## 🔄 Platform Workflow

```mermaid
flowchart TD
    A["Organizer creates event"] --> B["Add agenda and speakers"]
    B --> C["Generate scripts with AI"]
    C --> D["Start Live Mode"]
    D --> E["Anchor receives current script"]
    E --> F{"Schedule change?"}
    F -- No --> G["Advance to next activity"]
    G --> E
    F -- Yes --> H["Report delay or announcement"]
    H --> I["Recalculate schedule"]
    I --> J["Generate recovery script"]
    J --> E
```

The organizer and anchor views use the same `LiveEventState`. Socket.IO sends changes immediately, while the live-state API provides a polling fallback.

---

## 👩‍💻 Contributors

- [Prachita Bhatia](https://github.com/prachitabhatia)
- Neha Siju

---

## 💡 Why AnchorFlow?

Live events feel most disorganized during transitions, delays, and unexpected announcements—the exact moments when anchors need the clearest guidance. AnchorFlow gives organizers a reliable control layer and gives anchors the right words at the right moment, keeping the stage professional even when the original schedule changes.

---

\<p align="center">
&#x20; Built for smoother events—from the opening welcome to the final sign-off.
\</p>
