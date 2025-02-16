import { CanvasBuilder } from "./builder.js";
import { ConfigFactory } from "./config/default.js";

const canvasBuilder = new CanvasBuilder();

const configFactory = new ConfigFactory();
const config = configFactory.create();
canvasBuilder.withConfig(config);

const left = 0;
const top = 0;
const width = ((window.innerWidth / 10) * 9.8);
const height = ((window.innerHeight / 10) * 9.3);
const bounds = { left, top, width, height };

const canvas = canvasBuilder.build();
canvas.bounds = bounds;
canvas.draw();
