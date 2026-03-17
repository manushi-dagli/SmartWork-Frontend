import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { taskConfigApi } from "@/api/taskConfig.api";
import type { Task, DocumentMaster, Subtask } from "@/api/taskConfig.api";

type TabId = "tasks" | "subtasks" | "documents";

export default function Config() {
  const [tab, setTab] = useState<TabId>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [documents, setDocuments] = useState<DocumentMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [types, subList, docs] = await Promise.all([
        taskConfigApi.listTasks(),
        taskConfigApi.listSubtasks(),
        taskConfigApi.listDocuments(),
      ]);
      setTasks(types);
      setSubtasks(subList);
      setDocuments(docs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Task config</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure tasks, subtasks, and document list (Super Admin and Admin).
        </p>
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <div className="overflow-x-auto -mx-1 px-1 touch-pan-x">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
            <TabsTrigger value="documents">Document list</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="tasks" className="mt-4">
          <TasksSection list={tasks} loading={loading} onReload={load} />
        </TabsContent>
        <TabsContent value="subtasks" className="mt-4">
          <SubtasksSection
            subtasks={subtasks}
            tasks={tasks}
            loading={loading}
            onReload={load}
          />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentsSection
            list={documents}
            loading={loading}
            onReload={load}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TasksSection({
  list,
  loading,
  onReload,
}: {
  list: Task[];
  loading: boolean;
  onReload: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setErr(null);
    setDialogOpen(true);
  };
  const openEdit = (row: Task) => {
    setEditing(row);
    setName(row.name);
    setDescription(row.description ?? "");
    setErr(null);
    setDialogOpen(true);
  };
  const close = () => {
    setDialogOpen(false);
    setErr(null);
  };

  const submit = async () => {
    if (!name.trim()) {
      setErr("Name is required");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      if (editing) {
        await taskConfigApi.updateTask(editing.id, {
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        await taskConfigApi.createTask({
          name: name.trim(),
          description: description.trim() || null,
        });
      }
      close();
      onReload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await taskConfigApi.deleteTask(id);
      onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading) return <p className="text-muted-foreground py-8">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add task</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.description ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => openEdit(row)} className="mr-2">
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteRow(row.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {list.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">No tasks. Add one to get started.</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit task" : "Add task"}</DialogTitle>
          </DialogHeader>
          {err && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{err}</div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="at-name">Name</Label>
              <Input
                id="at-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tax Filing"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="at-desc">Description</Label>
              <Textarea
                id="at-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubtasksSection({
  subtasks,
  tasks,
  loading,
  onReload,
}: {
  subtasks: Subtask[];
  tasks: Task[];
  loading: boolean;
  onReload: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subtask | null>(null);
  const [taskId, setTaskId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const taskNameById = Object.fromEntries(tasks.map((t) => [t.id, t.name]));

  const filteredSubtasks =
    selectedTaskIds.size === 0
      ? subtasks
      : subtasks.filter((s) => selectedTaskIds.has(s.taskId));

  const toggleTaskFilter = (id: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearTaskFilter = () => setSelectedTaskIds(new Set());

  const openCreate = () => {
    setEditing(null);
    setTaskId("");
    setName("");
    setDescription("");
    setErr(null);
    setDialogOpen(true);
  };
  const openEdit = (row: Subtask) => {
    setEditing(row);
    setTaskId(row.taskId);
    setName(row.name);
    setDescription(row.description ?? "");
    setErr(null);
    setDialogOpen(true);
  };
  const close = () => {
    setDialogOpen(false);
    setErr(null);
  };

  const submit = async () => {
    if (!taskId || !name.trim()) {
      setErr("Task and name are required");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      if (editing) {
        await taskConfigApi.updateSubtask(editing.id, {
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        await taskConfigApi.createSubtask({
          taskId,
          name: name.trim(),
          description: description.trim() || null,
        });
      }
      close();
      onReload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete this subtask?")) return;
    try {
      await taskConfigApi.deleteSubtask(id);
      onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading) return <p className="text-muted-foreground py-8">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {selectedTaskIds.size === 0
                ? "Filter by task"
                : `Tasks: ${selectedTaskIds.size} selected`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Show subtasks for</p>
              <p className="text-xs text-muted-foreground">
                Select one or more tasks. Leave all unchecked to show all subtasks.
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2 pt-1">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`task-filter-${t.id}`}
                      checked={selectedTaskIds.has(t.id)}
                      onCheckedChange={() => toggleTaskFilter(t.id)}
                    />
                    <label
                      htmlFor={`task-filter-${t.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {t.name}
                    </label>
                  </div>
                ))}
              </div>
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              )}
              {selectedTaskIds.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={clearTaskFilter}
                >
                  Clear filter
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
        {selectedTaskIds.size > 0 && (
          <span className="text-sm text-muted-foreground">
            Showing subtasks for {Array.from(selectedTaskIds).map((id) => taskNameById[id]).join(", ")}
          </span>
        )}
        <div className="flex-1" />
        <Button onClick={openCreate}>Add subtask</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Subtask name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubtasks.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{taskNameById[row.taskId] ?? "—"}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.description ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => openEdit(row)} className="mr-2">
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteRow(row.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredSubtasks.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">
          {subtasks.length === 0
            ? "No subtasks. Add a task first, then add subtasks."
            : "No subtasks for the selected tasks. Change the filter or add subtasks."}
        </p>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit subtask" : "Add subtask"}</DialogTitle>
          </DialogHeader>
          {err && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{err}</div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="st-task">Task *</Label>
              <select
                id="st-task"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                disabled={!!editing}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— Select task —</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-name">Subtask name *</Label>
              <Input
                id="st-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Subtask name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="st-desc">Description</Label>
              <Textarea
                id="st-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DocumentsSection({
  list,
  loading,
  onReload,
}: {
  list: DocumentMaster[];
  loading: boolean;
  onReload: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentMaster | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setErr(null);
    setDialogOpen(true);
  };
  const openEdit = (row: DocumentMaster) => {
    setEditing(row);
    setName(row.name);
    setDescription(row.description ?? "");
    setErr(null);
    setDialogOpen(true);
  };
  const close = () => {
    setDialogOpen(false);
    setErr(null);
  };

  const submit = async () => {
    if (!name.trim()) {
      setErr("Name is required");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };
      if (editing) {
        await taskConfigApi.updateDocument(editing.id, payload);
      } else {
        await taskConfigApi.createDocument(payload);
      }
      close();
      onReload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      await taskConfigApi.deleteDocument(id);
      onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading) return <p className="text-muted-foreground py-8">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add document</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.description ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => openEdit(row)} className="mr-2">
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteRow(row.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {list.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">No documents. Add one to get started.</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit document" : "Add document"}</DialogTitle>
          </DialogHeader>
          {err && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{err}</div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="doc-name">Name</Label>
              <Input
                id="doc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Document name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doc-desc">Description</Label>
              <Textarea
                id="doc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
