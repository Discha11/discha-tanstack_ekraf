import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { adapter } from "./db";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
	database: adapter,
	emailAndPassword: { enabled: true, requireEmailVerification: false, minPasswordLength: 8 },
	session: {
		expiresIn: 60 * 60 * 8, // sesi habis dalam 8 jam
		updateAge: 60 * 60,
		cookieCache: { enabled: true, maxAge: 60 * 5 },
	},
	rateLimit: {
		enabled: true,
		window: 60,
		max: 60,
		customRules: {
			"/sign-in/email": { window: 60, max: 5 },
			"/sign-up/email": { window: 60, max: 3 },
		},
	},
	advanced: {
		useSecureCookies: isProd,
		defaultCookieAttributes: { httpOnly: true, sameSite: "lax", secure: isProd },
	},
	plugins: [tanstackStartCookies()],
});
export default auth;
