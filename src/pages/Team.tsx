import { useQuery } from "@tanstack/react-query";
import { listEmployees } from "@/api/employees.api";
import { listRoles } from "@/api/roles.api";
import type { EmployeeListItem, AppRole } from "@/types/team";
import { tasks } from "@/data/mockData";
import type { Task } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { useState } from "react";

function getInitials(firstName: string, lastName: string): string {
  const f = firstName?.trim().charAt(0) ?? "";
  const l = lastName?.trim().charAt(0) ?? "";
  return (f + l).toUpperCase() || "?";
}

function getRoleName(roleId: string | null, roles: AppRole[]): string {
  if (!roleId) return "—";
  const role = roles.find((r) => r.id === roleId);
  return role?.name ?? role?.value ?? "—";
}

/** Map employee index (0-based) to mock assigneeId "1", "2", ... for task stats. */
function getTasksForEmployeeIndex(employeeIndex: number): Task[] {
  const assigneeId = String(employeeIndex + 1);
  return tasks.filter((t) => t.assigneeId === assigneeId);
}

export default function Team() {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: listRoles,
  });
  const roles = rolesData ?? [];

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees", selectedRoleId],
    queryFn: () =>
      listEmployees({
        roleId: selectedRoleId ?? undefined,
        limit: 100,
        sortBy: "lastName",
        sortOrder: "asc",
      }),
  });

  const employees = employeesData?.data ?? [];
  const isLoading = rolesLoading || employeesLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your team members and their assignments
        </p>
      </div>

      {/* Role filter from backend */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={selectedRoleId === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedRoleId(null)}
        >
          All
        </Button>
        {roles.map((role) => (
          <Button
            key={role.id}
            variant={selectedRoleId === role.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRoleId(role.id)}
          >
            {role.name}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-8 text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {employees.map((member: EmployeeListItem, index: number) => {
            const memberTasks = getTasksForEmployeeIndex(index);
            const tasksAssigned = memberTasks.length;
            const tasksCompleted = memberTasks.filter((t) => t.status === "completed").length;
            const completionRate =
              tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;
            const activeTasks = memberTasks.filter((t) => t.status !== "completed").slice(0, 2);

            return (
              <div
                key={member.id}
                className="bg-card rounded-lg border border-border p-5 animate-fade-in hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={member.profilePicture ?? undefined} alt="" />
                    <AvatarFallback className="stat-gradient text-primary-foreground font-bold text-sm">
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getRoleName(member.roleId, roles)}
                    </p>
                    {member.email && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-secondary/50 rounded-md p-2.5 text-center">
                      <p className="text-lg font-bold">{tasksAssigned}</p>
                      <p className="text-xs text-muted-foreground">Assigned</p>
                    </div>
                    <div className="bg-secondary/50 rounded-md p-2.5 text-center">
                      <p className="text-lg font-bold">{tasksCompleted}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>

                  {activeTasks.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs font-medium mb-2">Active Tasks</p>
                      {activeTasks.map((t) => (
                        <p key={t.id} className="text-xs text-muted-foreground truncate py-0.5">
                          • {t.title}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && employees.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          No team members found.
        </div>
      )}
    </div>
  );
}
