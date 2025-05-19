import { CanvasBuilder } from "./builder.js";
import { ConfigFactory } from "./config/factory.js";
import { RepositoryFactory } from "./repository/factory.js";
import { CrosslyCanvasWatcher } from "./canvas/crossly/watcher.js";
import { CrosslyCanvasObserver } from "./canvas/crossly/observer.js";

const configFactory = new ConfigFactory();
const config = configFactory.create();

const canvasBuilder = new CanvasBuilder();
canvasBuilder.withConfig(config);
const canvasFacade = canvasBuilder.build();
canvasFacade.draw();

// TODO: delete everything below !!! It is used for testing purpose only
const repositoryFactory = new RepositoryFactory();
const repository = repositoryFactory.create();

const w = window as any;
w.crosslyCanvas = canvasFacade;
w.crosslyRepository = repository;

// const observer = new CrosslyCanvasObserver(canvasFacade);
// const watcher = new CrosslyCanvasWatcher(observer, repository);