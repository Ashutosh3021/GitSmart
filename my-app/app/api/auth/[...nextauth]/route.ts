/**
 * NextAuth.js API route
 * Handles GitHub OAuth authentication
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
