import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, type Client, type CreateClientBody } from "@/api/clients.api";
import { taskRequestsApi, type SubtaskWithTask } from "@/api/taskRequests.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus } from "lucide-react";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "—";
  }
}

export default function Clients() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateClientBody>({
    firstName: "",
    lastName: "",
    email1: "",
    taskId: "",
    subtaskId: "",
    taskDueDate: "",
    subtaskDueDate: "",
    assignmentTerms: "",
    paymentTerms: "",
    paymentCost: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.listClients(),
  });
  const { data: subtasksWithTask = [] } = useQuery({
    queryKey: ["subtasks-with-task"],
    queryFn: () => taskRequestsApi.listSubtasksWithTask(),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["task-types"],
    queryFn: () => taskRequestsApi.listTaskTypes(),
  });

  const taskNameById: Record<string, string> = Object.fromEntries(tasks.map((t) => [t.id, t.name]));
  (subtasksWithTask as SubtaskWithTask[]).forEach((s) => {
    taskNameById[s.taskId] = s.taskName;
  });
  const subtaskById = Object.fromEntries((subtasksWithTask as SubtaskWithTask[]).map((s) => [s.id, s]));

  const openCreate = () => {
    setForm({
      firstName: "",
      lastName: "",
      email1: "",
      taskId: "",
      subtaskId: "",
      taskDueDate: "",
      subtaskDueDate: "",
      assignmentTerms: "",
      paymentTerms: "",
      paymentCost: "",
    });
    setErr(null);
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      setErr("First name and last name are required");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await clientsApi.createClient({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleName: form.middleName || null,
        email1: form.email1?.trim() || null,
        taskId: form.taskId || null,
        subtaskId: form.subtaskId || null,
        taskDueDate: form.taskDueDate || null,
        subtaskDueDate: form.subtaskDueDate || null,
        assignmentTerms: form.assignmentTerms?.trim() || null,
        paymentTerms: form.paymentTerms?.trim() || null,
        paymentCost: form.paymentCost?.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      setDialogOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create client");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and view clients; link them to a task or subtask with optional due dates.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add client
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-8 text-center">Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Task / Subtask</TableHead>
              <TableHead>Task due</TableHead>
              <TableHead>Subtask due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c: Client) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  {c.firstName} {c.lastName}
                </TableCell>
                <TableCell>{c.email1 ?? "—"}</TableCell>
                <TableCell>
                  {c.subtaskId
                    ? (subtaskById[c.subtaskId] ? `${subtaskById[c.subtaskId].taskName} / ${subtaskById[c.subtaskId].name}` : "—")
                    : c.taskId
                      ? taskNameById[c.taskId] ?? "—"
                      : "—"}
                </TableCell>
                <TableCell>{formatDate(c.taskDueDate)}</TableCell>
                <TableCell>{formatDate(c.subtaskDueDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && clients.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">No clients yet. Add one to get started.</div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add client</DialogTitle>
          </DialogHeader>
          {err && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{err}</div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client-first">First name *</Label>
                <Input
                  id="client-first"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-last">Last name *</Label>
                <Input
                  id="client-last"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={form.email1 ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email1: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-subtask">Subtask (optional)</Label>
              <select
                id="client-subtask"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.subtaskId ?? ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const sub = (subtasksWithTask as SubtaskWithTask[]).find((s) => s.id === id);
                  setForm((f) => ({
                    ...f,
                    subtaskId: id || "",
                    taskId: sub ? sub.taskId : "",
                  }));
                }}
              >
                <option value="">— None —</option>
                {(subtasksWithTask as SubtaskWithTask[]).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.taskName} — {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client-task-due">Task due date (optional)</Label>
                <Input
                  id="client-task-due"
                  type="date"
                  value={form.taskDueDate ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, taskDueDate: e.target.value || undefined }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-subtask-due">Subtask due date (optional)</Label>
                <Input
                  id="client-subtask-due"
                  type="date"
                  value={form.subtaskDueDate ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subtaskDueDate: e.target.value || undefined }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-assignment-terms">Assignment terms (optional)</Label>
              <Textarea
                id="client-assignment-terms"
                value={form.assignmentTerms ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, assignmentTerms: e.target.value }))}
                placeholder="Assignment terms for this client"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-payment-terms">Payment terms (optional)</Label>
              <Textarea
                id="client-payment-terms"
                value={form.paymentTerms ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))}
                placeholder="Payment terms for this client"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-payment-cost">Payment / cost (optional)</Label>
              <Input
                id="client-payment-cost"
                value={form.paymentCost ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, paymentCost: e.target.value }))}
                placeholder="e.g. INR 5,000 or Rupees"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Creating…" : "Create client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
