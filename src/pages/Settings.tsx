
import { useState } from "react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";

export default function Settings() {
    const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

    return (
        <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === "profile" ? <ProfileSettings /> : <SecuritySettings />}
        </SettingsLayout>
    );
}
