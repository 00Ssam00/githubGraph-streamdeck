import streamDeck from "@elgato/streamdeck";
import { IncrementCounter } from "./actions/increment-counter";
import { HeatmapWeek } from "./actions/heatmap-week";  // ← AGREGAR

// Registrar acciones
streamDeck.actions.registerAction(new IncrementCounter());
streamDeck.actions.registerAction(new HeatmapWeek());  // ← AGREGAR

// Conectar
streamDeck.connect();