import { Router, type IRouter } from "express";
import healthRouter from "./health";
import siteAdminRouter from "./site-admin";
import { imageRouter } from "./site-images";
import adminAuthRouter from "./admin-auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(imageRouter);
router.use(adminAuthRouter);
router.use(siteAdminRouter);

export default router;
