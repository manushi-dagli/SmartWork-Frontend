import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignmentsApi,
  type Assignment,
  type CreateAssignmentBody,
} from "@/api/assignments.api";
import { clientsApi, type Client } from "@/api/clients.api";
import { taskRequestsApi } from "@/api/taskRequests.api";
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
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function Assignments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [form, setForm] = useState<CreateAssignmentBody & { clientId: string; taskId: string }>({
    clientId: "",
    taskId: "",
    financialYear: "",
    startDate: "",
    dueDate: "",
    managerId: "",
    estimatedFees: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["assignments", statusFilter],
    queryFn: () =>
      assignmentsApi.listAssignments(
        statusFilter ? { status: statusFilter } : undefined
      ),
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.listClients(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["task-types"],
    queryFn: () => taskRequestsApi.listTaskTypes(),
  });
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => listEmployees({ limit: 500 }),
  });
  const employees = employeesData?.data ?? [];

  const clientById = Object.fromEntries(
    (clients as Client[]).map((c) => [c.id, `${c.firstName} ${c.lastName}`])
  );
  const taskNameById = Object.fromEntries(tasks.map((t) => [t.id, t.name]));
  const employeeNameById = Object.fromEntries(
    employees.map((e: { id: string; firstName: string; lastName: string }) => [
      e.id,
      `${e.firstName} ${e.lastName}`,
    ])
  );

  const openCreate = () => {
    setForm({
      clientId: "",
      taskId: "",
      financialYear: "",
      startDate: "",
      dueDate: "",
      managerId: "",
      estimatedFees: "",
    });
    setErr(null);
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!form.clientId || !form.taskId) {
      setErr("Client and task are required");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await assignmentsApi.createAssignment({
        clientId: form.clientId,
        taskId: form.taskId,
        financialYear: form.financialYear || null,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        managerId: form.managerId || null,
        estimatedFees: form.estimatedFees || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setDialogOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Engagements per client and task type; create after inquiry conversion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New assignment
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-8 text-center">Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Task type</TableHead>
              <TableHead>FY</TableHead>
              <TableHead>Start / Due</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Estimated fees</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(assignments as Assignment[]).map((a) => (
              <TableRow
                key={a.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/assignments/${a.id}`)}
              >
                <TableCell className="font-medium">
                  {clientById[a.clientId] ?? a.clientId}
                </TableCell>
                <TableCell>{taskNameById[a.taskId] ?? a.taskId}</TableCell>
                <TableCell>{a.financialYear ?? "—"}</TableCell>
                <TableCell>
                  {formatDate(a.startDate)} / {formatDate(a.dueDate)}
                </TableCell>
                <TableCell>
                  {a.managerId ? employeeNameById[a.managerId] ?? "—" : "—"}
                </TableCell>
                <TableCell>{a.estimatedFees ?? "—"}</TableCell>
                <TableCell>{a.status ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && assignments.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          No assignments yet. Create one from a client and task type.
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New assignment</DialogTitle>
          </DialogHeader>
          {err && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">
              {err}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asn-client">Client *</Label>
              <select
                id="asn-client"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.clientId}
                onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              >
                <option value="">— Select —</option>
                {(clients as Client[]).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asn-task">Task type *</Label>
              <select
                id="asn-task"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.taskId}
                onChange={(e) => setForm((f) => ({ ...f, taskId: e.target.value }))}
              >
                <option value="">— Select —</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asn-fy">Financial year</Label>
              <Input
                id="asn-fy"
                value={form.financialYear ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, financialYear: e.target.value }))}
                placeholder="e.g. 2024-25"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="asn-start">Start date</Label>
                <Input
                  id="asn-start"
                  type="date"
                  value={form.startDate ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value || undefined }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asn-due">Due date</Label>
                <Input
                  id="asn-due"
                  type="date"
                  value={form.dueDate ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value || undefined }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asn-manager">Manager</Label>
              <select
                id="asn-manager"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.managerId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, managerId: e.target.value || undefined }))
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
              <Label htmlFor="asn-fees">Estimated fees</Label>
              <Input
                id="asn-fees"
                value={form.estimatedFees ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, estimatedFees: e.target.value }))}
                placeholder="Amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Creating…" : "Create assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
