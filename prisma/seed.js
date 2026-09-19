require("dotenv").config();
const prisma = require("../src/db");
const { EVENT_STATUS, EVENT_TONE, ARRIVAL_STATUS, AGENDA_STATUS } = require("../src/constants");

const DEMO_EVENT_ID = "demo-event-001";

async function main() {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.event.deleteMany({ where: { id: DEMO_EVENT_ID } });

      const start = new Date();
      start.setHours(10, 0, 0, 0);
      // Stable timestamps and IDs make repeated runs on the same day identical.
      const timestamps = { createdAt: start, updatedAt: start };
      await tx.event.create({ data: {
        id: DEMO_EVENT_ID,
        name: "Innovate 2026 National Hackathon",
        type: "hackathon",
        tone: EVENT_TONE.ENERGETIC,
        status: EVENT_STATUS.DRAFT,
        date: start,
        ...timestamps,
      } });

      // Fictional demo profiles with specific material for generated introductions.
      const speakers = [
        {
          name: "Ananya Rao", role: "Co-founder and Chief Technology Officer", organization: "CircuitSpring Labs",
          bio: "Ananya Rao is the co-founder and chief technology officer of CircuitSpring Labs, where she builds low-power sensor networks for small farms. Over 12 years in embedded systems, she has led projects ranging from solar-powered soil monitors to offline irrigation controllers. Since 2022, her FieldLink project has helped cooperatives diagnose pump failures using vibration data collected on inexpensive microcontrollers. She mentors student teams on turning a weekend prototype into a device that survives a full growing season.",
        },
        {
          name: "Dr. Meera Iyer", role: "Clinical AI Research Lead", organization: "CareWeave Research Institute",
          bio: "Dr. Meera Iyer leads clinical AI research at CareWeave Research Institute, focusing on decision-support tools for resource-limited clinics. She spent eight years working with clinicians and machine-learning engineers on medical imaging and model evaluation. Her current project, TriageLens, studies how chest X-ray models handle changes in scanner hardware and patient populations before clinical deployment. She teaches teams to measure false negatives, protect patient data, and design interfaces that keep clinical judgment with the doctor.",
        },
        {
          name: "Kabir Menon", role: "Principal Engineer and Hackathon Jury Chair", organization: "OpenHarbor Systems",
          bio: "Kabir Menon is a principal engineer at OpenHarbor Systems, specializing in distributed systems and accessible public-service software. During 14 years in engineering, he has built multilingual application portals and payment reconciliation services that recover safely from network failures. In 2023, he led the QueueLight project, an offline-capable appointment system designed for district service counters. As a hackathon judge and mentor, he asks teams to demonstrate user research, explain failure cases, and show a working path from prototype to deployment.",
        },
        {
          name: "Nisha Verma", role: "Director of Student Innovation", organization: "LaunchNest Foundation",
          bio: "Nisha Verma directs student innovation programs at LaunchNest Foundation, connecting campus teams with product mentors and pilot partners. Over ten years, she has designed accelerator workshops covering customer interviews, prototype testing, and early operating budgets. She launched the BuildForward fellowship in 2021 to help student teams run six-week field pilots for assistive technology and local climate projects. At Innovate 2026, she will celebrate the winning teams and outline how participants can continue testing their ideas after the prizes are awarded.",
        },
      ];
      for (let index = 0; index < speakers.length; index++) {
        await tx.speaker.create({ data: {
          ...speakers[index], id: `${DEMO_EVENT_ID}-speaker-${index + 1}`,
          eventId: DEMO_EVENT_ID, arrivalStatus: ARRIVAL_STATUS.NOT_ARRIVED, ...timestamps,
        } });
      }

      const agenda = [
        { title: "Opening Ceremony", type: "ceremony", durationMinutes: 15 },
        { title: "Keynote", type: "talk", durationMinutes: 30, speaker: 1 },
        { title: "Networking Buffer", type: "buffer", durationMinutes: 10, isBuffer: true },
        { title: "Guest Speaker: AI in Healthcare", type: "talk", durationMinutes: 30, speaker: 2 },
        { title: "Lunch Break", type: "break", durationMinutes: 45 },
        { title: "Judging Panel Briefing", type: "panel", durationMinutes: 25, speaker: 3 },
        { title: "Closing and Prize Distribution", type: "ceremony", durationMinutes: 20, speaker: 4 },
      ];
      let plannedStart = new Date(start);
      for (let orderIndex = 0; orderIndex < agenda.length; orderIndex++) {
        const { speaker, ...item } = agenda[orderIndex];
        await tx.agendaItem.create({ data: {
          ...item, id: `${DEMO_EVENT_ID}-agenda-${orderIndex}`, eventId: DEMO_EVENT_ID,
          speakerId: speaker ? `${DEMO_EVENT_ID}-speaker-${speaker}` : null,
          plannedStart, orderIndex, offsetMinutes: 0, isBuffer: item.isBuffer ?? false,
          status: AGENDA_STATUS.UPCOMING, ...timestamps,
        } });
        plannedStart = new Date(plannedStart.getTime() + item.durationMinutes * 60000);
      }
    });
    console.log(`Seeded ${DEMO_EVENT_ID}: 4 speakers and 7 agenda items, starting today at 10:00 local time.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
