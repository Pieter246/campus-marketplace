import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/firebase/server";
import { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UpdatePasswordForm from "./update-password-form";

export default async function Account() {
  const cookieStore = await cookies();
  const token = cookieStore.get("firebaseAuthToken")?.value;

  if (!token) {
    redirect("/");
  }

  let decodedToken: DecodedIdToken;

  try {
    decodedToken = await auth.verifyIdToken(token);
  } catch (e) {
    redirect("/");
  }

  const user = await auth.getUser(decodedToken.uid);
  const isPasswordProvider = user.providerData.some(
    (provider) => provider.providerId === "password"
  );

  return (
    <div className="flex justify-center">
      <Card className="mt-10 w-full max-w-md">
        <CardContent>
          {isPasswordProvider ? (
            <UpdatePasswordForm />
          ) : (
            <div className="text-center text-zinc-500 py-6">
              <p className="text-2xl font-bold">Signed in with Google</p>
              <p className="mt-4 text-xl">
                Password updates must be managed through your Google Account
                settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
