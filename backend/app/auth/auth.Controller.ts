import { Request, Response } from "express";
import { ErrorResponse, Ok } from "../../utils/api-response";
import { LoginSchema } from "./auth.Schema";
import { authService } from "./auth.Service";
import { ENV } from "../../constants";

class Controller {
  /**
   * User login endpoint
   * Supports both development (NIP-only) and production (Polibatam API) authentication
   */
  async login(req: Request, res: Response) {
    try {
      const data: LoginSchema = req.body;

      // Validate required fields based on environment
      if (ENV.NODE_ENV !== "development" && !data.password) {
        throw new Error("Password is required for production environment");
      }

      // Authenticate user
      const authResult = await authService.authenticate({
        username: data.username,
        password: data.password || "",
      });

      // Validate user access
      authService.validateUserAccess(authResult.user);

      const responseData = {
        user: authResult.user,
        token: authResult.token,
        environment: ENV.NODE_ENV,
      };

      return Ok({
        res,
        data: responseData,
        message: `Login successful${
          ENV.NODE_ENV === "development" ? " (Development Mode)" : ""
        }`,
      });
    } catch (error) {
      return ErrorResponse({
        req,
        res,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown authentication error"),
      });
    }
  }

  /**
   * Get current user info (for future use)
   */
  async me(req: Request, res: Response) {
    try {
      // This would typically get user info from JWT token
      // Implementation depends on your auth middleware
      return Ok({
        res,
        data: {
          ...req.user
        },
        message: "Success",
      });
    } catch (error) {
      return ErrorResponse({
        req,
        res,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    }
  }

  async role_and_permissions(req: Request, res: Response) {
    try {
      return Ok({
        res,
        data: {
          role: req.user?.role,
          permissions: req.user?.permissions
        }
      });
    } catch (error) {
      return ErrorResponse({
        req,
        res,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    }
  }

  /**
   * User logout endpoint (for future use)
   */
  async logout(req: Request, res: Response) {
    try {
      // Implementation for logout logic (e.g., blacklist token)
      return Ok({
        res,
        data: null,
        message: "Logout successful",
      });
    } catch (error) {
      return ErrorResponse({
        req,
        res,
        error:
          error instanceof Error ? error : new Error("Unknown logout error"),
      });
    }
  }
}

export const AuthController = new Controller();
