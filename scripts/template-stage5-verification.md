Event Templates Stage 5 verification

Existing test command: npm run test:schedule
Result: all schedule tests passed

HTTP regression checks ran against the real development database with mock AI and a simulated provider outage. Authentication headers are omitted from the log.

```text
◇ injected env (0) from .env
{"check":"zero-agenda template","result":"PASS","status":201,"agendaItems":[],"derivedAgendaItems":[]}
{"check":"normal event and agenda regression","result":"PASS","create":201,"reorder":200,"delete":204,"remaining":[{"title":"Closing","orderIndex":0},{"title":"Session","orderIndex":1}]}
{"check":"delete derived event preserves template","result":"PASS","deleteStatus":204,"templateGetStatus":200,"templateUnchanged":true,"agendaItemCount":2}
{"check":"delete used template preserves both events","result":"PASS","deleteStatus":204,"events":[{"id":"cmu9layy3000cw6g08li5pef5","status":200,"unchanged":true},{"id":"cmu9layz7000hw6g0zfnjq6x6","status":200,"unchanged":true}],"templateItemsRemaining":0}
{"check":"validation: missing name","result":"PASS","status":400,"response":{"error":{"code":"BAD_REQUEST","message":"name must be a string","details":{"field":"name"}}}}
{"check":"validation: short name","result":"PASS","status":400,"response":{"error":{"code":"BAD_REQUEST","message":"name must have length between 2 and 120","details":{"field":"name"}}}}
{"check":"validation: null name","result":"PASS","status":400,"response":{"error":{"code":"BAD_REQUEST","message":"name must be a string","details":{"field":"name"}}}}
{"check":"validation: missing date","result":"PASS","status":400,"response":{"error":{"code":"BAD_REQUEST","message":"date must be an ISO date or timestamp with timezone","details":{"field":"date"}}}}
{"check":"validation: invalid date","result":"PASS","status":400,"response":{"error":{"code":"BAD_REQUEST","message":"date must be an ISO date or timestamp with timezone","details":{"field":"date"}}}}
{"check":"validation: impossible date","result":"PASS","status":400,"response":{"error":{"code":"BAD_REQUEST","message":"date must be a valid calendar date","details":{"field":"date"}}}}
{"check":"validation: null date","result":"PASS","status":400,"response":{"error":{"code":"BAD_REQUEST","message":"date must be an ISO date or timestamp with timezone","details":{"field":"date"}}}}
{"check":"no auth: POST /events/cmu9layog0000w6g075y59ph2/save-as-template","result":"PASS","status":401,"response":{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid organizer passcode","details":null}}}
{"check":"no auth: GET /templates","result":"PASS","status":401,"response":{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid organizer passcode","details":null}}}
{"check":"no auth: GET /templates/cmu9laypp0001w6g076fd6c33","result":"PASS","status":401,"response":{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid organizer passcode","details":null}}}
{"check":"no auth: DELETE /templates/cmu9laypp0001w6g076fd6c33","result":"PASS","status":401,"response":{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid organizer passcode","details":null}}}
{"check":"no auth: POST /templates/cmu9laypp0001w6g076fd6c33/create-event","result":"PASS","status":401,"response":{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid organizer passcode","details":null}}}
{"check":"script regression","result":"PASS","sevenTypes":200,"list":200,"edit":200,"providerFailure":200,"fallbackSource":"fallback"}
{"check":"live lifecycle and snapshot regression","result":"PASS","goLive":200,"publicPoll":200,"pause":200,"resume":200,"advance":200,"advancePastEnd":200,"endWithClosing":200}
{"check":"route mounting","result":"PASS","eventDetail":200,"agenda":200,"speakers":200,"scripts":200,"liveControls":200,"publicEnergy":200,"publicCrowdBrain":200,"noShadowing":true}
ALL STAGE 5 CHECKS PASSED
Only temporary verification events/templates removed.
```

