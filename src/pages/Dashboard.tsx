import { ListTodo, CheckCircle2, AlertTriangle, Clock, Target } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { tasks, milestones, teamMembers, statusColors, categoryLabels, type TaskCategory } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const totalTasks = tasks.length;
const completedTasks = tasks.filter(t => t.status === "completed").length;
const overdueTasks = tasks.filter(t => t.status === "overdue").length;
const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;

const categoryData = Object.entries(
  tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([name, value]) => ({ name: categoryLabels[name as TaskCategory], value }));

const statusData = [
  { name: "Completed", value: completedTasks, color: "hsl(152, 60%, 40%)" },
  { name: "In Progress", value: inProgressTasks, color: "hsl(210, 80%, 52%)" },
  { name: "Pending", value: tasks.filter(t => t.status === "pending").length, color: "hsl(215, 20%, 65%)" },
  { name: "Overdue", value: overdueTasks, color: "hsl(0, 72%, 51%)" },
];

export default function Dashboard() {
  const recentTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your firm's tasks and milestones</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={totalTasks} subtitle={`${completedTasks} completed`} icon={ListTodo} variant="accent" />
        <StatCard title="Completed" value={completedTasks} subtitle={`${Math.round((completedTasks / totalTasks) * 100)}% done`} icon={CheckCircle2} variant="success" />
        <StatCard title="In Progress" value={inProgressTasks} icon={Clock} variant="default" />
        <StatCard title="Overdue" value={overdueTasks} subtitle="Needs attention" icon={AlertTriangle} variant="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border p-5">
          <h3 className="font-semibold mb-4">Tasks by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-semibold mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name} ({s.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Milestones</h3>
          </div>
          <div className="space-y-4">
            {milestones.map(m => (
              <div key={m.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{m.title}</span>
                  <span className="text-xs text-muted-foreground">{m.completedTasks}/{m.totalTasks} tasks</span>
                </div>
                <Progress value={m.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">Due: {new Date(m.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-semibold mb-4">Upcoming Tasks</h3>
          <div className="space-y-3">
            {recentTasks.map(t => {
              const assignee = teamMembers.find(m => m.id === t.assigneeId);
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 animate-fade-in">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.clientName} • {assignee?.name}</p>
                  </div>
                  <Badge variant="outline" className={`ml-3 shrink-0 text-xs ${statusColors[t.status]}`}>
                    {t.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
