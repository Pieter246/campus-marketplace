"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { auth } from "@/firebase/client"; // your client.ts
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phoneNumber: z.string().min(1, "Required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
  newPasswordConfirm: z.string().min(6),
}).superRefine((data, ctx) => {
  if (data.newPassword !== data.newPasswordConfirm) {
    ctx.addIssue({
      code: "custom",
      path: ["newPasswordConfirm"],
      message: "Passwords do not match",
    });
  }
});

const db = getFirestore();

export default function AccountPage() {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [isPasswordProvider, setIsPasswordProvider] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phoneNumber: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", newPasswordConfirm: "" },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsPasswordProvider(user.providerData.some(p => p.providerId === "password"));

      const userDocRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        profileForm.reset({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phoneNumber: data.phoneNumber ?? "",
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: `${data.firstName} ${data.lastName}` });
      await setDoc(doc(db, "users", user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      }, { merge: true });
      toast.success("Profile updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Error updating profile");
    }
  };

  const handlePasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    if (!user || !user.email) return;
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, data.currentPassword));
      await updatePassword(user, data.newPassword);
      toast.success("Password updated successfully!");
      passwordForm.reset();
    } catch (e: any) {
      console.error(e);
      toast.error(e.code === "auth/invalid-credential" ? "Current password incorrect" : "Error updating password");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div className="text-center text-red-500">No user signed in</div>;

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-6xl bg-white pt-6 px-6">

        <div className="flex flex-col md:flex-row gap-8">
          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-4 text-center md:text-left">User Information</h2>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                <fieldset className="flex flex-col gap-4" disabled={profileForm.formState.isSubmitting}>
                  <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} label="First Name" />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} label="Last Name" />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={profileForm.control} name="phoneNumber" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} label="Phone Number" />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormItem>
                    <FormControl>
                      <Input value={user.email ?? ""} label="Email" disabled className="text-gray-400" />
                    </FormControl>
                  </FormItem>
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>Update Profile</Button>
                </fieldset>
              </form>
            </Form>
          </div>

          {/* Password Update */}
          {isPasswordProvider && (
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-4 text-center md:text-left">Update Password</h2>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                  <fieldset className="flex flex-col gap-4" disabled={passwordForm.formState.isSubmitting}>
                    <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type="password" label="Current Password" />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type="password" label="New Password" />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={passwordForm.control} name="newPasswordConfirm" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type="password" label="Confirm Password" />
                        </FormControl>
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Update Password</Button>
                  </fieldset>
                </form>
              </Form>
            </div>
          )}

          {!isPasswordProvider && (
            <div className="text-center text-gray-500 flex-1">
              Signed in with Google. Password updates must be done in your Google Account settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
