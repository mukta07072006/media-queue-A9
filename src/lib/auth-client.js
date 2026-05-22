import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    // ✅ Fix: Use the NEXT_PUBLIC prefixed variable, or fallback to the current window location
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL || (typeof window !== "undefined" ? window.location.origin : undefined),
    plugins: [
        jwtClient() 
    ]
})
const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });
};