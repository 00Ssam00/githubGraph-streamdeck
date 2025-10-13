import streamDeck from "@elgato/streamdeck";
import { IncrementCounter } from "./actions/increment-counter";
import { HeatmapWeek } from "./actions/heatmap-week";

streamDeck.actions.registerAction(new IncrementCounter());
streamDeck.actions.registerAction(new HeatmapWeek());

streamDeck.connect();