import streamDeck from "@elgato/streamdeck";
import { IncrementCounter } from "./actions/increment-counter";
import { HeatmapWeek } from "./actions/heatmap-week";
import { HeatmapMonth } from "./actions/heatmap-month";

streamDeck.actions.registerAction(new IncrementCounter());
streamDeck.actions.registerAction(new HeatmapWeek());
streamDeck.actions.registerAction(new HeatmapMonth());

streamDeck.connect();