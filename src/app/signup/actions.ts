"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validations";

export async function signup(formData: FormData) {
  const displayName = formData.get("display_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = signupSchema.safeParse({ display_name: displayName, email, password });
  if (!result.success) {
    redirect(`/signup?error=${encodeURIComponent(result.error.issues[0].message)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        display_name: result.data.display_name,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
