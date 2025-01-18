import { CanvasBuilder } from "./builder.js";

const canvasBuilder = new CanvasBuilder();
const canvas = canvasBuilder.build();

const dotsConfig = { x: 30, y: 20, radius: { value: 2, step: 0.2 }, spacing: { value: 20, step: 2 } };
canvas.draw(dotsConfig);