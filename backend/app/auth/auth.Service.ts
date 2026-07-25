import { tbm_user } from "@prisma/client";
import { ENV } from "../../constants";
import { PolibatamAct, polibatamInstance } from "../../lib/polibatam.service";
import { PolibatamResponseBiodata, PolibatamResponseLogin } from "../../types";
import { UserRepository } from "../user/user.Repository";
import { EncryptToken } from "../../utils/jwt";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  user: tbm_user;
  token: string;
}

class AuthService {
  /**
   * Authenticate user based on environment
   * Development: Use NIP from user table
   * Production: Use Polibatam API
   */
  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    if (ENV.NODE_ENV === "development") {
      return this.authenticateDevelopment(credentials);
    }

    if (ENV.NODE_ENV === "staging") {
      return this.authenticateStaging(credentials);
    }

    return this.authenticateProduction(credentials);
  }

  /**
   * Development authentication - Login using NIP from user table
   */
  private async authenticateDevelopment(
    credentials: LoginCredentials
  ): Promise<AuthResult> {
    const { username } = credentials;

    // In development, treat username as NIP
    const user = await UserRepository.FetchUserByNIP(username);

    if (!user) {
      throw new Error(
        "User not found. Please ensure user exists in the database."
      );
    }

    if (user.is_deleted) {
      throw new Error("User account is deactivated.");
    }

    const token = this.generateToken({ user });

    return {
      user,
      token,
    };
  }

  /**
   * Staging authentication - Login using Polibatam API. Allow Student To Login
   */
  private async authenticateStaging(
    credentials: LoginCredentials
  ): Promise<AuthResult> {
    const { username, password } = credentials;

    // Step 1: Login to Polibatam API
    const loginResponse: PolibatamResponseLogin = await polibatamInstance({
      method: "POST",
      data: {
        act: PolibatamAct.Login,
        username,
        password,
      },
    });

    if (loginResponse.error_code !== 0) {
      switch (loginResponse.error_code) {
        case 102:
          throw new Error("Username or Password Incorrect");
        default:
          throw new Error(`Unhandled Error Code From Polibatam Service: ${loginResponse.error_code}`);
      }
    }

    // Step 2: Get user biodata
    const biodataResponse: PolibatamResponseBiodata = await polibatamInstance({
      method: "POST",
      data: {
        act: PolibatamAct.GetBiodata,
        secretkey: loginResponse.data.secretkey,
      },
    });

    // Step 4: Check or insert user in database
    const user = await UserRepository.checkOrInsertUser({
      nip: biodataResponse.data.id,
      secretkey: loginResponse.data.secretkey,
    });

    // Step 5: Generate JWT token
    const token = this.generateToken({
      secretkey: loginResponse.data.secretkey,
      user,
    });

    return {
      user,
      token,
    };
  }

  /**
   * Production authentication - Login using Polibatam API
   */
  private async authenticateProduction(
    credentials: LoginCredentials
  ): Promise<AuthResult> {
    const { username, password } = credentials;

    // Step 1: Login to Polibatam API
    const loginResponse: PolibatamResponseLogin = await polibatamInstance({
      method: "POST",
      data: {
        act: PolibatamAct.Login,
        username,
        password,
      },
    });

    if (loginResponse.error_code !== 0) {
      switch (loginResponse.error_code) {
        case 102:
          throw new Error("Username or Password Incorrect");
        default:
          throw new Error(`Unhandled Error Code From Polibatam Service: ${loginResponse.error_code}`);
      }
    }

    // Step 2: Get user biodata
    const biodataResponse: PolibatamResponseBiodata = await polibatamInstance({
      method: "POST",
      data: {
        act: PolibatamAct.GetBiodata,
        secretkey: loginResponse.data.secretkey,
      },
    });

    // Step 3: Validate user role
    if (biodataResponse.data.role === "Mahasiswa") {
      throw new Error("Mahasiswa tidak bisa login");
    }

    // Step 4: Check or insert user in database
    const user = await UserRepository.checkOrInsertUser({
      nip: biodataResponse.data.id,
      secretkey: loginResponse.data.secretkey,
    });

    // Step 5: Generate JWT token
    const token = this.generateToken({
      secretkey: loginResponse.data.secretkey,
      user,
    });

    return {
      user,
      token,
    };
  }

  /**
   * Generate JWT token for authenticated user
   */
  private generateToken(payload: {
    user: tbm_user;
    secretkey?: string;
  }): string {
    return EncryptToken(payload);
  }

  /**
   * Validate if user can access the system
   */
  validateUserAccess(user: tbm_user): void {
    if (user.is_deleted) {
      throw new Error("User account is deactivated");
    }
  }
}

export const authService = new AuthService();
