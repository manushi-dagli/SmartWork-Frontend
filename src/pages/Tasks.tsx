import { useState } from "react";
import { tasks, teamMembers, statusColors, priorityColors, categoryLabels, type TaskStatus, type TaskPriority, type TaskCategory } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Calendar, User } from "lucide-react";

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const filtered = tasks.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage all tasks, subtasks, and assignments</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filtered.map(task => {
          const assignee = teamMembers.find(m => m.id === task.assigneeId);
          const isExpanded = expandedTasks.has(task.id);
          const completedSubs = task.subtasks.filter(s => s.status === "completed").length;

          return (
            <div key={task.id} className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => toggleExpand(task.id)}
              >
                <button className="shrink-0 text-muted-foreground">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{task.title}</span>
                    <Badge variant="outline" className={`text-xs ${statusColors[task.status]}`}>{task.status}</Badge>
                    <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{categoryLabels[task.category]}</span>
                    <span>•</span>
                    <span>{task.clientName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{assignee?.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground shrink-0">
                  {completedSubs}/{task.subtasks.length} subtasks
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border bg-secondary/20 p-4 space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                  {task.subtasks.map(sub => {
                    const subAssignee = teamMembers.find(m => m.id === sub.assigneeId);
                    return (
                      <div key={sub.id} className="flex items-center justify-between py-2 px-3 rounded-md bg-background/60">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            sub.status === "completed" ? "bg-success" :
                            sub.status === "in-progress" ? "bg-info" : "bg-muted-foreground/40"
                          }`} />
                          <span className="text-sm">{sub.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{subAssignee?.name}</span>
                          <Badge variant="outline" className={`text-xs ${statusColors[sub.status]}`}>{sub.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No tasks match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
