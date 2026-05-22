import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    // ✅ Fix: Use the NEXT_PUBLIC prefixed variable, or fallback to the current window location
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        jwtClient() 
    ]
})
const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });
};