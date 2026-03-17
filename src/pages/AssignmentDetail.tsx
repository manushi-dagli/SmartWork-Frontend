import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignmentsApi,
  type AssignmentWithDetails,
} from "@/api/assignments.api";
import {
  allocatedTasksApi,
  type AllocatedTask,
  type CreateAllocatedTaskBody,
} from "@/api/allocatedTasks.api";
import {
  milestonesApi,
  type Milestone,
  type CreateMilestoneBody,
} from "@/api/milestones.api";
import { listEmployees } from "@/api/employees.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus } from "lucide-react";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState<CreateMilestoneBody & { assignmentId: string }>({
    assignmentId: id ?? "",
    name: "",
    responsibleEmployeeId: "",
    dueDate: "",
  });
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false);
  const [milestoneErr, setMilestoneErr] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAllocatedTaskBody & { assignmentId: string }>({
    assignmentId: id ?? "",
    description: "",
    assignedToId: "",
    dueDate: "",
    priority: "MEDIUM",
    checkingRequired: false,
    checkerId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: details, isLoading } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentsApi.getAssignment(id!, true),
    enabled: !!id,
  });
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["allocated-tasks", id],
    queryFn: () => allocatedTasksApi.listByAssignment(id!),
    enabled: !!id,
  });
  const { data: milestonesList = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ["milestones", id],
    queryFn: () => milestonesApi.listByAssignment(id!),
    enabled: !!id,
  });
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => listEmployees({ limit: 500 }),
  });
  const employees = employeesData?.data ?? [];
  const employeeNameById = Object.fromEntries(
    employees.map((e: { id: string; firstName: string; lastName: string }) => [
      e.id,
      `${e.firstName} ${e.lastName}`,
    ])
  );

  const assignment = details && "assignment" in details ? (details as AssignmentWithDetails).assignment : null;
  const client = details && "client" in details ? (details as AssignmentWithDetails).client : null;
  const task = details && "task" in details ? (details as AssignmentWithDetails).task : null;
  const manager = details && "manager" in details ? (details as AssignmentWithDetails).manager : null;

  const openCreate = () => {
    setForm({
      assignmentId: id ?? "",
      description: "",
      assignedToId: "",
      dueDate: "",
      priority: "MEDIUM",
      checkingRequired: false,
      checkerId: "",
    });
    setErr(null);
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!id) return;
    setSubmitting(true);
    setErr(null);
    try {
      await allocatedTasksApi.create({
        assignmentId: id,
        description: form.description || null,
        assignedToId: form.assignedToId || null,
        dueDate: form.dueDate || null,
        priority: form.priority ?? "MEDIUM",
        checkingRequired: form.checkingRequired ?? false,
        checkerId: form.checkerId || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["allocated-tasks", id] });
      setDialogOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to add task");
    } finally {
      setSubmitting(false);
    }
  };

  const openMilestoneCreate = () => {
    setMilestoneForm({
      assignmentId: id ?? "",
      name: "",
      responsibleEmployeeId: "",
      dueDate: "",
    });
    setMilestoneErr(null);
    setMilestoneDialogOpen(true);
  };

  const submitMilestone = async () => {
    if (!id || !milestoneForm.name?.trim()) {
      setMilestoneErr("Name is required");
      return;
    }
    setMilestoneSubmitting(true);
    setMilestoneErr(null);
    try {
      await milestonesApi.create({
        assignmentId: id,
        name: milestoneForm.name.trim(),
        responsibleEmployeeId: milestoneForm.responsibleEmployeeId || null,
        dueDate: milestoneForm.dueDate || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["milestones", id] });
      setMilestoneDialogOpen(false);
    } catch (e) {
      setMilestoneErr(e instanceof Error ? e.message : "Failed to add milestone");
    } finally {
      setMilestoneSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/assignments")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <p className="text-muted-foreground">Invalid assignment.</p>
      </div>
    );
  }

  if (isLoading || !assignment) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/assignments")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="text-muted-foreground py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assignments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignment</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {client ? `${client.firstName} ${client.lastName}` : "—"} · {task?.name ?? "—"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 grid gap-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Client</span>
          <span>{client ? `${client.firstName} ${client.lastName}` : "—"}</span>
          <span className="text-muted-foreground">Task type</span>
          <span>{task?.name ?? "—"}</span>
          <span className="text-muted-foreground">FY</span>
          <span>{assignment.financialYear ?? "—"}</span>
          <span className="text-muted-foreground">Manager</span>
          <span>{manager ? `${manager.firstName} ${manager.lastName}` : "—"}</span>
          <span className="text-muted-foreground">Status</span>
          <span>{assignment.status ?? "—"}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Allocated tasks</h2>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add task
          </Button>
        </div>
        {tasksLoading ? (
          <div className="text-muted-foreground py-4">Loading tasks...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Checking</TableHead>
                <TableHead>Checker</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(tasks as AllocatedTask[]).map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.description ?? "—"}</TableCell>
                  <TableCell>
                    {t.assignedToId ? employeeNameById[t.assignedToId] ?? "—" : "—"}
                  </TableCell>
                  <TableCell>{formatDate(t.dueDate)}</TableCell>
                  <TableCell>{t.priority ?? "—"}</TableCell>
                  <TableCell>{t.checkingRequired ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {t.checkerId ? employeeNameById[t.checkerId] ?? "—" : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!tasksLoading && tasks.length === 0 && (
          <div className="text-muted-foreground py-6 text-center border rounded-lg">
            No tasks allocated yet. Add one to assign work to an employee.
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Milestones</h2>
          <Button onClick={openMilestoneCreate} variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add milestone
          </Button>
        </div>
        {milestonesLoading ? (
          <div className="text-muted-foreground py-4">Loading milestones...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(milestonesList as Milestone[]).map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    {m.responsibleEmployeeId ? employeeNameById[m.responsibleEmployeeId] ?? "—" : "—"}
                  </TableCell>
                  <TableCell>{formatDate(m.dueDate)}</TableCell>
                  <TableCell>{m.status ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!milestonesLoading && milestonesList.length === 0 && (
          <div className="text-muted-foreground py-6 text-center border rounded-lg">
            No milestones yet. Add one to track progress.
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add allocated task</DialogTitle>
          </DialogHeader>
          {err && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">
              {err}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="at-desc">Description</Label>
              <Input
                id="at-desc"
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Task details"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="at-assigned">Assigned to</Label>
              <select
                id="at-assigned"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.assignedToId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignedToId: e.target.value || undefined }))
                }
              >
                <option value="">— None —</option>
                {employees.map((e: { id: string; firstName: string; lastName: string }) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="at-due">Due date</Label>
              <Input
                id="at-due"
                type="date"
                value={form.dueDate ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value || undefined }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="at-priority">Priority</Label>
              <select
                id="at-priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.priority ?? "MEDIUM"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value as CreateAllocatedTaskBody["priority"],
                  }))
                }
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="at-checking"
                checked={form.checkingRequired ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, checkingRequired: e.target.checked }))
                }
              />
              <Label htmlFor="at-checking">Checking required</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="at-checker">Checker</Label>
              <select
                id="at-checker"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.checkerId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, checkerId: e.target.value || undefined }))
                }
              >
                <option value="">— None —</option>
                {employees.map((e: { id: string; firstName: string; lastName: string }) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Adding…" : "Add task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add milestone</DialogTitle>
          </DialogHeader>
          {milestoneErr && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">
              {milestoneErr}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ms-name">Name *</Label>
              <Input
                id="ms-name"
                value={milestoneForm.name ?? ""}
                onChange={(e) => setMilestoneForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Collect documents"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ms-responsible">Responsible</Label>
              <select
                id="ms-responsible"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={milestoneForm.responsibleEmployeeId ?? ""}
                onChange={(e) =>
                  setMilestoneForm((f) => ({ ...f, responsibleEmployeeId: e.target.value || undefined }))
                }
              >
                <option value="">— None —</option>
                {employees.map((e: { id: string; firstName: string; lastName: string }) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ms-due">Due date</Label>
              <Input
                id="ms-due"
                type="date"
                value={milestoneForm.dueDate ?? ""}
                onChange={(e) =>
                  setMilestoneForm((f) => ({ ...f, dueDate: e.target.value || undefined }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMilestoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitMilestone} disabled={milestoneSubmitting}>
              {milestoneSubmitting ? "Adding…" : "Add milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
