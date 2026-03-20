import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { TagManagement } from "@/components/settings/tag-management";
import { Settings as SettingsIcon, Tag as TagIcon, Palette, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-1 mb-8">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
                        <SettingsIcon className="h-8 w-8 text-primary" />
                        Settings
                    </h1>
                    <p className="text-slate-500 font-medium">Manage your workspace preferences and organization</p>
                </div>

                <Tabs defaultValue="tags" className="space-y-6">
                    <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
                        <TabsTrigger value="tags" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2">
                            <TagIcon className="h-4 w-4" />
                            Tags
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2">
                            <Palette className="h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                        <TabsTrigger value="notifications" disabled className="gap-2 opacity-50 rounded-lg px-4 py-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tags" className="focus-visible:outline-none ring-0">
                        <TagManagement />
                    </TabsContent>

                    <TabsContent value="appearance" className="focus-visible:outline-none ring-0">
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <Palette className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Theme Settings</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">Theme customization can be accessed via the sidebar toggle and the timer settings panel.</p>
                        </div>
                    </TabsContent>
                </Tabs>
        </div>
    );
}
