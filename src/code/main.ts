import { CanvasBuilder } from "./builder.js";

const canvasBuilder = new CanvasBuilder();
const canvas = canvasBuilder.build();

const dotsConfig = { columns: 30, rows: 20, radius: { value: 2, step: 0.2 }, spacing: { value: 20, step: 2 } };
canvas.draw(dotsConfig);