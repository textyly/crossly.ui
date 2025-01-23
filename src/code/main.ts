import { CanvasBuilder } from "./builder.js";

const canvasBuilder = new CanvasBuilder();
const canvas = canvasBuilder.build();

const dotsConfig = { columns: 40, rows: 30, radius: { value: 2, step: 0.2 }, spacing: { value: 30, step: 2 } };
canvas.draw(dotsConfig);