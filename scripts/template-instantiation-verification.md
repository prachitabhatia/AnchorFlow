Event Templates Stage 4 — actual HTTP acceptance log

Requests ran against the real dev database through an ephemeral Express HTTP server.
The organizer passcode header was supplied but is omitted from this transcript.

```text
◇ injected env (0) from .env
POST /events
Request: {"name":"Hackathon","type":"hackathon","tone":"energetic","date":"2026-10-01T10:00:00.000Z"}
HTTP 201
{"id":"cmu9l6u4q0000w69soa40v17o","name":"Hackathon","type":"hackathon","tone":"energetic","date":"2026-10-01T10:00:00.000Z","status":"draft","createdAt":"2026-09-20T09:01:06.699Z","updatedAt":"2026-09-20T09:01:06.699Z","sourceTemplateId":null}

POST /events/cmu9l6u4q0000w69soa40v17o/agenda
Request: {"title":"Opening","type":"activity","durationMinutes":10,"plannedStart":"2026-10-01T10:00:00.000Z"}
HTTP 201
{"id":"cmu9l6u610002w69s5n9h17mr","eventId":"cmu9l6u4q0000w69soa40v17o","title":"Opening","type":"activity","speakerId":null,"plannedStart":"2026-10-01T10:00:00.000Z","durationMinutes":10,"offsetMinutes":0,"orderIndex":0,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.746Z","updatedAt":"2026-09-20T09:01:06.746Z","effectiveStart":"2026-10-01T10:00:00.000Z","effectiveEnd":"2026-10-01T10:10:00.000Z"}

POST /events/cmu9l6u4q0000w69soa40v17o/agenda
Request: {"title":"Problem Statement","type":"activity","durationMinutes":20,"plannedStart":"2026-10-01T10:10:00.000Z"}
HTTP 201
{"id":"cmu9l6u710004w69su77olnbd","eventId":"cmu9l6u4q0000w69soa40v17o","title":"Problem Statement","type":"activity","speakerId":null,"plannedStart":"2026-10-01T10:10:00.000Z","durationMinutes":20,"offsetMinutes":0,"orderIndex":1,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.781Z","updatedAt":"2026-09-20T09:01:06.781Z","effectiveStart":"2026-10-01T10:10:00.000Z","effectiveEnd":"2026-10-01T10:30:00.000Z"}

POST /events/cmu9l6u4q0000w69soa40v17o/agenda
Request: {"title":"Mentoring","type":"activity","durationMinutes":30,"plannedStart":"2026-10-01T10:30:00.000Z"}
HTTP 201
{"id":"cmu9l6u870006w69s56d4dx9f","eventId":"cmu9l6u4q0000w69soa40v17o","title":"Mentoring","type":"activity","speakerId":null,"plannedStart":"2026-10-01T10:30:00.000Z","durationMinutes":30,"offsetMinutes":0,"orderIndex":2,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.823Z","updatedAt":"2026-09-20T09:01:06.823Z","effectiveStart":"2026-10-01T10:30:00.000Z","effectiveEnd":"2026-10-01T11:00:00.000Z"}

POST /events/cmu9l6u4q0000w69soa40v17o/agenda
Request: {"title":"Evaluation","type":"activity","durationMinutes":25,"plannedStart":"2026-10-01T11:00:00.000Z"}
HTTP 201
{"id":"cmu9l6u9b0008w69sreoqsspo","eventId":"cmu9l6u4q0000w69soa40v17o","title":"Evaluation","type":"activity","speakerId":null,"plannedStart":"2026-10-01T11:00:00.000Z","durationMinutes":25,"offsetMinutes":0,"orderIndex":3,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.863Z","updatedAt":"2026-09-20T09:01:06.863Z","effectiveStart":"2026-10-01T11:00:00.000Z","effectiveEnd":"2026-10-01T11:25:00.000Z"}

POST /events/cmu9l6u4q0000w69soa40v17o/agenda
Request: {"title":"Closing","type":"activity","durationMinutes":10,"plannedStart":"2026-10-01T11:25:00.000Z"}
HTTP 201
{"id":"cmu9l6ua6000aw69sxluannhk","eventId":"cmu9l6u4q0000w69soa40v17o","title":"Closing","type":"activity","speakerId":null,"plannedStart":"2026-10-01T11:25:00.000Z","durationMinutes":10,"offsetMinutes":0,"orderIndex":4,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.894Z","updatedAt":"2026-09-20T09:01:06.894Z","effectiveStart":"2026-10-01T11:25:00.000Z","effectiveEnd":"2026-10-01T11:35:00.000Z"}

POST /events/cmu9l6u4q0000w69soa40v17o/save-as-template
Request: {"name":"Hackathon Template"}
HTTP 201
{"id":"cmu9l6uaw000bw69sw2lggdhe","name":"Hackathon Template","description":null,"type":"hackathon","tone":"energetic","createdAt":"2026-09-20T09:01:06.920Z","updatedAt":"2026-09-20T09:01:06.920Z","agendaItems":[{"id":"cmu9l6uaw000cw69sqbhkoypl","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Opening","type":"activity","durationMinutes":10,"orderIndex":0,"isBuffer":false},{"id":"cmu9l6uaw000dw69syu6do0fq","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Problem Statement","type":"activity","durationMinutes":20,"orderIndex":1,"isBuffer":false},{"id":"cmu9l6uaw000ew69sylvjdl4d","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Mentoring","type":"activity","durationMinutes":30,"orderIndex":2,"isBuffer":false},{"id":"cmu9l6uaw000fw69syd2c9i86","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Evaluation","type":"activity","durationMinutes":25,"orderIndex":3,"isBuffer":false},{"id":"cmu9l6uaw000gw69snx8uckre","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Closing","type":"activity","durationMinutes":10,"orderIndex":4,"isBuffer":false}]}

POST /templates/cmu9l6uaw000bw69sw2lggdhe/create-event
Request: {"name":"Hackathon 2026-A","date":"2026-10-02T10:00:00.000Z"}
HTTP 201
{"id":"cmu9l6ube000hw69s6nve582d","name":"Hackathon 2026-A","type":"hackathon","tone":"energetic","date":"2026-10-02T10:00:00.000Z","status":"draft","createdAt":"2026-09-20T09:01:06.938Z","updatedAt":"2026-09-20T09:01:06.938Z","sourceTemplateId":"cmu9l6uaw000bw69sw2lggdhe","speakers":[],"agendaItems":[{"id":"cmu9l6ubi000jw69swejdif8z","eventId":"cmu9l6ube000hw69s6nve582d","title":"Opening","type":"activity","speakerId":null,"plannedStart":"2026-10-02T10:00:00.000Z","durationMinutes":10,"offsetMinutes":0,"orderIndex":0,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.942Z","updatedAt":"2026-09-20T09:01:06.942Z"},{"id":"cmu9l6ubk000lw69sx91cz9ak","eventId":"cmu9l6ube000hw69s6nve582d","title":"Problem Statement","type":"activity","speakerId":null,"plannedStart":"2026-10-02T10:10:00.000Z","durationMinutes":20,"offsetMinutes":0,"orderIndex":1,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.944Z","updatedAt":"2026-09-20T09:01:06.944Z"},{"id":"cmu9l6ubn000nw69s9ge25v8b","eventId":"cmu9l6ube000hw69s6nve582d","title":"Mentoring","type":"activity","speakerId":null,"plannedStart":"2026-10-02T10:30:00.000Z","durationMinutes":30,"offsetMinutes":0,"orderIndex":2,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.947Z","updatedAt":"2026-09-20T09:01:06.947Z"},{"id":"cmu9l6ubp000pw69s4eikj5yh","eventId":"cmu9l6ube000hw69s6nve582d","title":"Evaluation","type":"activity","speakerId":null,"plannedStart":"2026-10-02T11:00:00.000Z","durationMinutes":25,"offsetMinutes":0,"orderIndex":3,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.949Z","updatedAt":"2026-09-20T09:01:06.949Z"},{"id":"cmu9l6ubr000rw69sx0o1ojpj","eventId":"cmu9l6ube000hw69s6nve582d","title":"Closing","type":"activity","speakerId":null,"plannedStart":"2026-10-02T11:25:00.000Z","durationMinutes":10,"offsetMinutes":0,"orderIndex":4,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.951Z","updatedAt":"2026-09-20T09:01:06.951Z"}]}

DELETE /agenda/cmu9l6ubn000nw69s9ge25v8b
HTTP 204
(empty body)

POST /events/cmu9l6ube000hw69s6nve582d/agenda
Request: {"title":"Prize Distribution","type":"ceremony","durationMinutes":15,"plannedStart":"2026-10-02T11:35:00.000Z"}
HTTP 201
{"id":"cmu9l6udf000tw69slmggcjxd","eventId":"cmu9l6ube000hw69s6nve582d","title":"Prize Distribution","type":"ceremony","speakerId":null,"plannedStart":"2026-10-02T11:35:00.000Z","durationMinutes":15,"offsetMinutes":0,"orderIndex":4,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:07.011Z","updatedAt":"2026-09-20T09:01:07.011Z","effectiveStart":"2026-10-02T11:35:00.000Z","effectiveEnd":"2026-10-02T11:50:00.000Z"}

GET /events/cmu9l6ube000hw69s6nve582d/agenda
HTTP 200
[{"id":"cmu9l6ubi000jw69swejdif8z","eventId":"cmu9l6ube000hw69s6nve582d","title":"Opening","type":"activity","speakerId":null,"plannedStart":"2026-10-02T10:00:00.000Z","durationMinutes":10,"offsetMinutes":0,"orderIndex":0,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.942Z","updatedAt":"2026-09-20T09:01:06.942Z","effectiveStart":"2026-10-02T10:00:00.000Z","effectiveEnd":"2026-10-02T10:10:00.000Z"},{"id":"cmu9l6ubk000lw69sx91cz9ak","eventId":"cmu9l6ube000hw69s6nve582d","title":"Problem Statement","type":"activity","speakerId":null,"plannedStart":"2026-10-02T10:10:00.000Z","durationMinutes":20,"offsetMinutes":0,"orderIndex":1,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.944Z","updatedAt":"2026-09-20T09:01:06.944Z","effectiveStart":"2026-10-02T10:10:00.000Z","effectiveEnd":"2026-10-02T10:30:00.000Z"},{"id":"cmu9l6ubp000pw69s4eikj5yh","eventId":"cmu9l6ube000hw69s6nve582d","title":"Evaluation","type":"activity","speakerId":null,"plannedStart":"2026-10-02T11:00:00.000Z","durationMinutes":25,"offsetMinutes":0,"orderIndex":2,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.949Z","updatedAt":"2026-09-20T09:01:06.983Z","effectiveStart":"2026-10-02T11:00:00.000Z","effectiveEnd":"2026-10-02T11:25:00.000Z"},{"id":"cmu9l6ubr000rw69sx0o1ojpj","eventId":"cmu9l6ube000hw69s6nve582d","title":"Closing","type":"activity","speakerId":null,"plannedStart":"2026-10-02T11:25:00.000Z","durationMinutes":10,"offsetMinutes":0,"orderIndex":3,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:06.951Z","updatedAt":"2026-09-20T09:01:06.987Z","effectiveStart":"2026-10-02T11:25:00.000Z","effectiveEnd":"2026-10-02T11:35:00.000Z"},{"id":"cmu9l6udf000tw69slmggcjxd","eventId":"cmu9l6ube000hw69s6nve582d","title":"Prize Distribution","type":"ceremony","speakerId":null,"plannedStart":"2026-10-02T11:35:00.000Z","durationMinutes":15,"offsetMinutes":0,"orderIndex":4,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:07.011Z","updatedAt":"2026-09-20T09:01:07.011Z","effectiveStart":"2026-10-02T11:35:00.000Z","effectiveEnd":"2026-10-02T11:50:00.000Z"}]

GET /templates/cmu9l6uaw000bw69sw2lggdhe
HTTP 200
{"id":"cmu9l6uaw000bw69sw2lggdhe","name":"Hackathon Template","description":null,"type":"hackathon","tone":"energetic","createdAt":"2026-09-20T09:01:06.920Z","updatedAt":"2026-09-20T09:01:06.920Z","agendaItems":[{"id":"cmu9l6uaw000cw69sqbhkoypl","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Opening","type":"activity","durationMinutes":10,"orderIndex":0,"isBuffer":false},{"id":"cmu9l6uaw000dw69syu6do0fq","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Problem Statement","type":"activity","durationMinutes":20,"orderIndex":1,"isBuffer":false},{"id":"cmu9l6uaw000ew69sylvjdl4d","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Mentoring","type":"activity","durationMinutes":30,"orderIndex":2,"isBuffer":false},{"id":"cmu9l6uaw000fw69syd2c9i86","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Evaluation","type":"activity","durationMinutes":25,"orderIndex":3,"isBuffer":false},{"id":"cmu9l6uaw000gw69snx8uckre","templateId":"cmu9l6uaw000bw69sw2lggdhe","title":"Closing","type":"activity","durationMinutes":10,"orderIndex":4,"isBuffer":false}]}

POST /templates/cmu9l6uaw000bw69sw2lggdhe/create-event
Request: {"name":"Hackathon 2026-B","date":"2026-10-03T10:00:00.000Z"}
HTTP 201
{"id":"cmu9l6uer000uw69svoximeed","name":"Hackathon 2026-B","type":"hackathon","tone":"energetic","date":"2026-10-03T10:00:00.000Z","status":"draft","createdAt":"2026-09-20T09:01:07.059Z","updatedAt":"2026-09-20T09:01:07.059Z","sourceTemplateId":"cmu9l6uaw000bw69sw2lggdhe","speakers":[],"agendaItems":[{"id":"cmu9l6ueu000ww69ssboh1dv8","eventId":"cmu9l6uer000uw69svoximeed","title":"Opening","type":"activity","speakerId":null,"plannedStart":"2026-10-03T10:00:00.000Z","durationMinutes":10,"offsetMinutes":0,"orderIndex":0,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:07.062Z","updatedAt":"2026-09-20T09:01:07.062Z"},{"id":"cmu9l6uew000yw69s73clpa07","eventId":"cmu9l6uer000uw69svoximeed","title":"Problem Statement","type":"activity","speakerId":null,"plannedStart":"2026-10-03T10:10:00.000Z","durationMinutes":20,"offsetMinutes":0,"orderIndex":1,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:07.064Z","updatedAt":"2026-09-20T09:01:07.064Z"},{"id":"cmu9l6uey0010w69son5xpy0n","eventId":"cmu9l6uer000uw69svoximeed","title":"Mentoring","type":"activity","speakerId":null,"plannedStart":"2026-10-03T10:30:00.000Z","durationMinutes":30,"offsetMinutes":0,"orderIndex":2,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:07.067Z","updatedAt":"2026-09-20T09:01:07.067Z"},{"id":"cmu9l6uf10012w69soliqyh5n","eventId":"cmu9l6uer000uw69svoximeed","title":"Evaluation","type":"activity","speakerId":null,"plannedStart":"2026-10-03T11:00:00.000Z","durationMinutes":25,"offsetMinutes":0,"orderIndex":3,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:07.069Z","updatedAt":"2026-09-20T09:01:07.069Z"},{"id":"cmu9l6uf30014w69s0py7rrb7","eventId":"cmu9l6uer000uw69svoximeed","title":"Closing","type":"activity","speakerId":null,"plannedStart":"2026-10-03T11:25:00.000Z","durationMinutes":10,"offsetMinutes":0,"orderIndex":4,"isBuffer":false,"status":"upcoming","createdAt":"2026-09-20T09:01:07.071Z","updatedAt":"2026-09-20T09:01:07.071Z"}]}

PASS: first derived event customized independently; original template unchanged; second derived event has original five items.
Additional checks passed: event-detail response shape, distinct IDs, inherited/overridden fields, offset-aware startTime, date-only UTC, midnight rollover, defaults, invalid-input rollback, 401 and 404.
Temporary acceptance-test events and template removed; existing dev records preserved.
```

