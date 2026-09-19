const express = require("express");
const cors = require("cors");
const devRouter = require("./routes/dev");
const eventsRouter = require("./routes/events");
const { eventSpeakersRouter, speakersRouter } = require("./routes/speakers");
const { eventAgendaRouter, agendaRouter } = require("./routes/agenda");
const { generateRouter, eventScriptsRouter, scriptsRouter } = require("./routes/scripts");
const ApiError = require("./utils/ApiError");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "anchor-backend",
    time: new Date().toISOString(),
  });
});

app.use("/dev", devRouter);
app.use("/events", eventsRouter);
app.use("/events/:eventId/speakers", eventSpeakersRouter);
app.use("/speakers", speakersRouter);
app.use("/events/:eventId/agenda", eventAgendaRouter);
app.use("/agenda", agendaRouter);
app.use("/generate-script", generateRouter);
app.use("/events/:eventId/scripts", eventScriptsRouter);
app.use("/scripts", scriptsRouter);
app.use((req, res, next) => next(ApiError.notFound("Route not found")));
app.use(errorHandler);

module.exports = app;
