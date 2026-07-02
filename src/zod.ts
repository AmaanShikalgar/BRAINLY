import {z} from "zod";

export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string()
        .min(8)
        .max(20)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,{
            message:"Password must contain uppercase, lowercase, number and special character"
            }
        ),
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20)
});

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const contentScheme = z.object({
    link: z.string().url(),

    type: z.enum([
        "twitter",
        "youtube",
        "document",
        "link",
        "instagram",
        "reddit"
    ]),

    title: z.string()
});
