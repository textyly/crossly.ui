import { CanvasBuilder } from "./builder.js";
import { ConfigFactory } from "./config/default.js";

const canvasBuilder = new CanvasBuilder();

const configFactory = new ConfigFactory();
const config = configFactory.create();
canvasBuilder.withConfig(config);

const canvas = canvasBuilder.build();
canvas.draw();


canvas.bounds = { x: 100, y: 100, width: 500, height: 500 };
canvas.draw();

(window as any).crossly = canvas;