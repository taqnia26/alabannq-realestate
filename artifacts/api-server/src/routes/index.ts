import { Router, type IRouter } from "express";
import healthRouter from "./health";
import siteAdminRouter from "./site-admin";
import { imageRouter } from "./site-images";

const router: IRouter = Router();

router.use(healthRouter);
router.use(imageRouter);
router.use(siteAdminRouter);

export default router;
