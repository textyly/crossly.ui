import { Menus } from "./menu/menus.js";
import { Dialogs } from "./dialog/dialog.js";
import { RepositoryFactory } from "./repository/factory.js";
import { MenuCanvasHandler } from "./menu/handlers/canvas.js";
import { CrosslyCanvasAnimationFactory } from "./animation/factory.js";
import { CrosslyCanvasFacadeFactory } from "./canvas/crossly/factory.js";
import { MenuDialogHandler } from "./menu/handlers/dialog.js";

const canvasFactory = new CrosslyCanvasFacadeFactory();
const canvas = canvasFactory.create();
canvas.draw();

// TODO: delete everything below !!! It is used for testing purpose only
const w = window as any;
w.crosslyCanvas = canvas;
w.crosslyCanvasFactory = canvasFactory;

const menus = new Menus(document);
const menuCanvasHandler = new MenuCanvasHandler(menus, canvas);
w.menuCanvasHandler = menuCanvasHandler;

const dialogs = new Dialogs(document);
const menuDialogHandler = new MenuDialogHandler(menus, dialogs);
w.menuDialogHandler = menuDialogHandler;

const repositoryFactory = new RepositoryFactory();
const repository = repositoryFactory.create();
w.crosslyRepository = repository;

const animationFactory = new CrosslyCanvasAnimationFactory();
w.crosslyAnimationFactory = animationFactory;