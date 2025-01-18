import { CanvasBuilder } from "./builder.js";

const canvasBuilder = new CanvasBuilder();
const canvas = canvasBuilder.build();

canvas.draw();
// canvas.draw(dotsConfig);