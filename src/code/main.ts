import { CanvasBuilder } from "./builder.js";
import { ConfigFactory } from "./config/default.js";

const canvasBuilder = new CanvasBuilder();

const configFactory = new ConfigFactory();
const config = configFactory.create();
canvasBuilder.withConfig(config);

const canvas = canvasBuilder.build();
(window as any).crossly = canvas;
canvas.draw();
