# AnchorFlow

An AI-powered event operations platform that keeps organizers and anchors synchronized when a live event changes.

Overview

College events depend on anchors and organizers coordinating schedules, speaker introductions, transitions, announcements, and delays in real time. These details are often spread across printed schedules and group chats, so one unexpected change can create confusion on stage.

AnchorFlow provides one shared live state through two focused interfaces:

Organizer Dashboard: Manage the event, agenda, speakers, scripts, delays, and announcements.

Anchor Dashboard: Display the current activity, an anchor-ready script, a countdown, and what comes next.

When an organizer reports a delay, AnchorFlow recalculates the schedule, generates an appropriate filler or transition script, and sends the update to the anchor without requiring a page refresh.

Core Workflow

flowchart TD
    A["Create event"] --> B["Add agenda and speakers"]
    B --> C["Generate scripts with AI"]
    C --> D["Start Live Mode"]
    D --> E["Organizer reports a delay"]
    E --> F["Schedule engine recalculates timings"]
    F --> G["AI prepares a recovery script"]
    G --> H["Anchor Dashboard updates live"]


Features

Organizer Dashboard

Create and manage events, speakers, guests, and agenda items

Reorder or retime activities

Generate, review, edit, and regenerate scripts

Start, pause, advance, and end a live event

Report delays and publish unexpected announcements

Mark speakers as arrived and notify the anchor

Anchor Dashboard :

Large, distraction-free script card

Current activity countdown

Next activity preview

Automatic schedule and announcement updates

Simple Mark Done / Next control

Adjustable font size and light/dark display modes

AI Script Generation

AnchorFlow uses event details, agenda context, speaker biographies, event tone, and live schedule status to generate:

Opening scripts

Speaker introductions

Activity introductions

Transition scripts

Delay filler scripts

Unexpected announcements

Closing scripts

Live Schedule Recovery

The scheduling engine performs time calculations with deterministic backend logic. AI generates the language used on stage and can suggest a recovery strategy, while the backend applies bounded, predictable schedule changes.

Example: if a speaker is delayed by 20 minutes, AnchorFlow can consume available buffer time, adjust later activities, generate a short audience-engagement script, and immediately update the anchor's screen.

Standout Features

One-Tap Recovery Cards

Pre-generated contingency scripts provide an immediate response for common situations such as a short delay, a cancellation, or technical difficulty. A freshly generated script can replace the cached version when it becomes available.

Vibe Meter

Organizers or audience volunteers can submit simple crowd-energy signals. When engagement drops, AnchorFlow can suggest a short, context-aware line for the anchor to re-engage the room.


The application keeps the organizer and anchor views synchronized through a shared LiveEventState. Socket.IO provides live updates, with polling available as a fallback.


Tech Stack

Frontend:

React, Vite, Tailwind CSS

Backend:

Node.js

Database:

SQLite, Prisma ORM

Real-time updates:

Socket.IO with polling fallback

AI

Configurable LLM API

Create a focused feature branch.

Keep commits small and clearly named.

Test the affected workflow locally.

Open a pull request describing what changed and how it was verified.
