import UserItemsTable from "./user-items-table";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Account from "../account/page";
import UserPurchaseTable from "./user-purchase-table";
import { Suspense } from "react";

export default async function UserDashboard({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const searchParamsValue = await searchParams;
  const tab = searchParamsValue?.tab || "dashboard"; // Default to 'dashboard'
  const page = searchParamsValue?.page ? parseInt(searchParamsValue.page) : 1;

  return (
    <Tabs defaultValue={tab} className="w-full">
      <TabsList className="w-full">
        <TabsTrigger
          value="dashboard"
          asChild
          className="text-xl rounded-sm data-[state=active]:primary data-[state=active]:text-white"
        >
          <Link href="/profile/user?tab=dashboard">My Items</Link>
        </TabsTrigger>
        <TabsTrigger
          value="purchases"
          asChild
          className="text-xl rounded-sm data-[state=active]:primary data-[state=active]:text-white"
        >
          <Link href="/profile/user?tab=purchases">My Purchases</Link>
        </TabsTrigger>
        <TabsTrigger
          value="account"
          asChild
          className="text-xl rounded-sm data-[state=active]:primary data-[state=active]:text-white"
        >
          <Link href="/profile/user?tab=account">Profile & Password</Link>
        </TabsTrigger>
      </TabsList>

      <Suspense fallback={<div>Loading...</div>}>
        {tab === "dashboard" && (
          <TabsContent value="dashboard">
            <div className="relative flex items-center mt-2 mb-4 mx-2">
              <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
                My Items
              </h1>
              <Button asChild className="ml-auto" variant="secondary">
                <Link href="/profile/new">Sell Item</Link>
              </Button>
            </div>

            <UserItemsTable page={page} />
          </TabsContent>
        )}
        {tab === "purchases" && (
          <TabsContent value="purchases">
            <h1 className="text-2xl font-bold ml-2 mt-2 text-center">Purchase History</h1>
            <UserPurchaseTable page={page} />
          </TabsContent>
        )}
        {tab === "account" && (
          <TabsContent value="account">
            <h1 className="text-2xl font-bold ml-2 mt-2 text-center">Update Your Information</h1>
            <Account />
          </TabsContent>
        )}
      </Suspense>
    </Tabs>
  );
}