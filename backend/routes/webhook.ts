import { Router } from "express";
import { UserController } from "../app/user/user.Controller";

const WebhookRoutes = Router().get(
  "/generate-user",
  UserController.GenerateUser
);

export default WebhookRoutes;
