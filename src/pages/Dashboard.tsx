import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Briefcase, MessageCircle, Receipt, ListTodo } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.getStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const cards = [
    {
      title: "Pending inquiries",
      value: stats?.pendingTaskRequests ?? 0,
      icon: FileQuestion,
    },
    {
      title: "Assignments in progress",
      value: stats?.assignmentsInProgress ?? 0,
      icon: Briefcase,
    },
    {
      title: "Assignments completed",
      value: stats?.assignmentsCompleted ?? 0,
      icon: Briefcase,
    },
    {
      title: "Open queries",
      value: stats?.openQueries ?? 0,
      icon: MessageCircle,
    },
    {
      title: "Unpaid invoices",
      value: stats?.unpaidInvoices ?? 0,
      icon: Receipt,
    },
    {
      title: "Tasks pending review",
      value: stats?.allocatedTasksWithoutReview ?? 0,
      icon: ListTodo,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of task requests, assignments, queries, and billing.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
