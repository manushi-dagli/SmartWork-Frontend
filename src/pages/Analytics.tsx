import { tasks, teamMembers, milestones, categoryLabels, type TaskCategory } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar } from "recharts";

const teamPerformance = teamMembers.map(m => ({
  name: m.name.split(" ")[0],
  assigned: m.tasksAssigned,
  completed: m.tasksCompleted,
}));

const categoryDistribution = Object.entries(
  tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([name, value]) => ({ name: categoryLabels[name as TaskCategory], value }));

const priorityDistribution = [
  { name: "Low", value: tasks.filter(t => t.priority === "low").length, color: "hsl(215, 20%, 65%)" },
  { name: "Medium", value: tasks.filter(t => t.priority === "medium").length, color: "hsl(210, 80%, 52%)" },
  { name: "High", value: tasks.filter(t => t.priority === "high").length, color: "hsl(38, 92%, 50%)" },
  { name: "Urgent", value: tasks.filter(t => t.priority === "urgent").length, color: "hsl(0, 72%, 51%)" },
];

const milestoneProgress = milestones.map(m => ({
  name: m.title.length > 20 ? m.title.slice(0, 20) + "..." : m.title,
  progress: m.progress,
  fill: m.progress >= 75 ? "hsl(152, 60%, 40%)" : m.progress >= 50 ? "hsl(38, 92%, 50%)" : "hsl(210, 80%, 52%)",
}));

const totalSubtasks = tasks.reduce((acc, t) => acc + t.subtasks.length, 0);
const completedSubtasks = tasks.reduce((acc, t) => acc + t.subtasks.filter(s => s.status === "completed").length, 0);

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Detailed insights into firm performance</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length },
          { label: "Total Subtasks", value: totalSubtasks },
          { label: "Completion Rate", value: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%` },
          { label: "Active Milestones", value: milestones.length },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-lg border border-border p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-semibold mb-4">Team Performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <Tooltip />
              <Bar dataKey="assigned" fill="hsl(220, 30%, 20%)" radius={[4, 4, 0, 0]} name="Assigned" />
              <Bar dataKey="completed" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-semibold mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityDistribution} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {priorityDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {priorityDistribution.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                <span className="text-muted-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-semibold mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} stroke="hsl(220, 10%, 46%)" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(152, 60%, 40%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Milestone Progress */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="font-semibold mb-4">Milestone Progress</h3>
          <div className="space-y-5">
            {milestones.map(m => (
              <div key={m.id} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{m.title}</span>
                  <span className={`font-bold ${m.progress >= 75 ? "text-success" : m.progress >= 50 ? "text-warning" : "text-info"}`}>
                    {m.progress}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${m.progress}%`,
                      background: m.progress >= 75 ? "hsl(152, 60%, 40%)" : m.progress >= 50 ? "hsl(38, 92%, 50%)" : "hsl(210, 80%, 52%)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{m.completedTasks}/{m.totalTasks} tasks</span>
                  <span>Due: {new Date(m.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
