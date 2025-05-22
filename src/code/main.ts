import { RepositoryFactory } from "./repository/factory.js";
import { CrosslyCanvasWatcher } from "./canvas/crossly/watcher.js";
import { CrosslyCanvasObserver } from "./canvas/crossly/observer.js";
import { CrosslyCanvasFacadeFactory } from "./canvas/crossly/factory.js";

const canvasCanvasFacadeFactory = new CrosslyCanvasFacadeFactory();
const crosslyCanvasFacade = canvasCanvasFacadeFactory.create();
crosslyCanvasFacade.draw();

// TODO: delete everything below !!! It is used for testing purpose only
const repositoryFactory = new RepositoryFactory();
const repository = repositoryFactory.create();

const w = window as any;
w.crosslyCanvas = crosslyCanvasFacade;
w.crosslyRepository = repository;

// const observer = new CrosslyCanvasObserver(canvasFacade);
// const watcher = new CrosslyCanvasWatcher(observer, repository);