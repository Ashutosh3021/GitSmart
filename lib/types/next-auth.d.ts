/**
 * NextAuth type declarations
 * Extends default types with custom properties
 */

import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    provider?: string;
    githubProfile?: Record<string, unknown>;
  }

  interface User {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    provider?: string;
    githubProfile?: Record<string, unknown>;
  }
}
