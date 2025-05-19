import { CanvasBuilder } from "./builder.js";
import { ConfigFactory } from "./config/factory.js";
import { RepositoryFactory } from "./repository/factory.js";
import { CrosslyCanvasWatcher } from "./canvas/crossly/watcher.js";
import { CrosslyCanvasObserver } from "./canvas/crossly/observer.js";

const canvasBuilder = new CanvasBuilder();

const configFactory = new ConfigFactory();
const config = configFactory.create();
canvasBuilder.withConfig(config);

const canvasFacade = canvasBuilder.build();
canvasFacade.draw();

// TODO: delete everything below !!! It is used for testing purpose only

const repositoryFactory = new RepositoryFactory();
const repository = repositoryFactory.create();

const w = window as any;
w.crossly = canvasFacade;
w.crosslyRepository = repository;

// const observer = new CrosslyCanvasObserver(canvasFacade);
// const watcher = new CrosslyCanvasWatcher(observer, repository);