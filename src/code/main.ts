import { CanvasBuilder } from "./builder.js";
import { ConfigFactory } from "./config/factory.js";
import { CrosslyCanvasWatcher } from "./repository/watcher.js";
import { CrosslyCanvasObserver } from "./canvas/crossly/observer.js";

const canvasBuilder = new CanvasBuilder();

const configFactory = new ConfigFactory();
const config = configFactory.create();
canvasBuilder.withConfig(config);

const canvasFacade = canvasBuilder.build();
canvasFacade.draw();

// Delete everything below !!!
(window as any).crossly = canvasFacade;

const observer = new CrosslyCanvasObserver(canvasFacade);
const watcher = new CrosslyCanvasWatcher(observer);
