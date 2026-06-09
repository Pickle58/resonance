import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardPage() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">
                Dashboard
            </h1>
        </div>
    )
}