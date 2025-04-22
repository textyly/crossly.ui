import { CanvasBuilder } from "./builder.js";
import { ConfigFactory } from "./config/factory.js";
import { CrosslyCanvasObserver } from "./observer/canvas.js";

const canvasBuilder = new CanvasBuilder();

const configFactory = new ConfigFactory();
const config = configFactory.create();
canvasBuilder.withConfig(config);

const canvasFacade = canvasBuilder.build();
(window as any).crossly = canvasFacade; // TODO: remove!!!
canvasFacade.draw();

const observer = new CrosslyCanvasObserver(canvasFacade);
