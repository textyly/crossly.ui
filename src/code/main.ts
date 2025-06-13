import { MenuHandler } from "./menu/handler.js";
import { MenuElementProvider } from "./menu/provider.js";
import { RepositoryFactory } from "./repository/factory.js";
import { CrosslyCanvasAnimationFactory } from "./animation/factory.js";
import { CrosslyCanvasFacadeFactory } from "./canvas/crossly/factory.js";

const canvasFactory = new CrosslyCanvasFacadeFactory();
const canvas = canvasFactory.create();
canvas.draw();

// TODO: delete everything below !!! It is used for testing purpose only
const w = window as any;
w.crosslyCanvas = canvas;
w.crosslyCanvasFactory = canvasFactory;

const menuElementProvider = new MenuElementProvider(document);
const menuHandler = new MenuHandler(canvas, menuElementProvider);
w.menuHandler = menuHandler;

const repositoryFactory = new RepositoryFactory();
const repository = repositoryFactory.create();
w.crosslyRepository = repository;

const animationFactory = new CrosslyCanvasAnimationFactory();
w.crosslyAnimationFactory = animationFactory;