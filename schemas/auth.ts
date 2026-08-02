import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

const newPasswordFields = {
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
};

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

export const signInSchema = z.object({
  emailAddress: emailField,
  password: z.string().min(1, "Password is required"),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters"),
    emailAddress: emailField,
    ...newPasswordFields,
  })
  .refine(passwordsMatch, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const mfaCodeSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
});
export type MfaCodeValues = z.infer<typeof mfaCodeSchema>;

export const forgotPasswordRequestSchema = z.object({
  emailAddress: emailField,
});
export type ForgotPasswordRequestValues = z.infer<
  typeof forgotPasswordRequestSchema
>;

export const resetPasswordSchema = z
  .object({
    code: z.string().trim().min(1, "Code is required"),
    ...newPasswordFields,
  })
  .refine(passwordsMatch, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
