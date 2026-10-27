import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins" 
import { sendEmail } from "./email";
import { VerificationEmail } from "@/emails/VerificationEmails";
import { dash } from "@better-auth/infra";


const client = new MongoClient(process.env.MONGODB_URI);
const url = process.env.BETTER_AUTH_URL || "http://localhost:3000"; 
const db = client.db('edu-flex');

export const auth = betterAuth({
   trustedOrigins: [url],
   emailAndPassword: {    
    requireEmailVerification: true,
        enabled: true
    } ,
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
        }, 
    },
  database: mongodbAdapter(db, {
    
    client
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        required: true,
        input: false,
      },
    },
  },

  emailVerification: {
    sendVerificationEmail: async ( { user, url, token }, request) => {
      void sendEmail({
       to: user.email,
        subject: "Verify your email address",
        react: <VerificationEmail verificationUrl={url} />
      });
    },
  },

  session:{
    cookieCache:{
      enabled: true,
      strategy: "jwt",
      maxAge: 60 * 60 * 24 * 7,
    }
  },
  plugins: [
        jwt(), 
        dash(),
    ]
});
