import z from "zod";

export const passwordValidation = z.string().min(6, "Password must be at least 6 characters")

export const registerUserSchema = z.object({
    email: z.email(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: passwordValidation,
    passwordConfirm: z.string()
})
.superRefine((data, ctx) => {
    if(data.password !== data.passwordConfirm){
        ctx.addIssue({
            message: "Passwords do not match",
            path: ["passwordConfirm"],
            code: "custom"
        })
    }
});