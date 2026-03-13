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
import { inquiryConfigApi } from "@/api/inquiryConfig.api";
import type {
  InquiryType,
  DocumentMaster,
  AssignmentTermTemplate,
  PaymentTermTemplate,
} from "@/api/inquiryConfig.api";

type TabId = "inquiry-types" | "documents" | "documents-per-inquiry-type" | "assignment-terms" | "payment-terms";

export default function Config() {
  const [tab, setTab] = useState<TabId>("inquiry-types");
  const [inquiryTypes, setInquiryTypes] = useState<InquiryType[]>([]);
  const [documents, setDocuments] = useState<DocumentMaster[]>([]);
  const [assignmentTermTemplates, setAssignmentTermTemplates] = useState<AssignmentTermTemplate[]>([]);
  const [paymentTermTemplates, setPaymentTermTemplates] = useState<PaymentTermTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [types, docs, aTerms, pTerms] = await Promise.all([
        inquiryConfigApi.listInquiryTypes(),
        inquiryConfigApi.listDocuments(),
        inquiryConfigApi.listAssignmentTermTemplates(),
        inquiryConfigApi.listPaymentTermTemplates(),
      ]);
      setInquiryTypes(types);
      setDocuments(docs);
      setAssignmentTermTemplates(aTerms);
      setPaymentTermTemplates(pTerms);
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
        <h1 className="text-2xl font-bold tracking-tight">Inquiry workflow config</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure inquiry types, document list, documents per inquiry type, and assignment & payment terms (Super Admin only).
        </p>
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList>
          <TabsTrigger value="inquiry-types">Inquiry types</TabsTrigger>
          <TabsTrigger value="documents">Document list</TabsTrigger>
          <TabsTrigger value="documents-per-inquiry-type">Documents per inquiry type</TabsTrigger>
          <TabsTrigger value="assignment-terms">Assignment term templates</TabsTrigger>
          <TabsTrigger value="payment-terms">Payment term templates</TabsTrigger>
        </TabsList>
        <TabsContent value="inquiry-types" className="mt-4">
          <InquiryTypesSection list={inquiryTypes} loading={loading} onReload={load} />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentsSection
            list={documents}
            inquiryTypes={inquiryTypes}
            loading={loading}
            onReload={load}
          />
        </TabsContent>
        <TabsContent value="documents-per-inquiry-type" className="mt-4">
          <DocumentsPerInquiryTypeSection
            documents={documents}
            inquiryTypes={inquiryTypes}
            loading={loading}
            onReload={load}
          />
        </TabsContent>
        <TabsContent value="assignment-terms" className="mt-4">
          <TermTemplatesSection<AssignmentTermTemplate>
            title="Assignment term templates"
            list={assignmentTermTemplates}
            inquiryTypes={inquiryTypes}
            loading={loading}
            onReload={load}
            createApi={inquiryConfigApi.createAssignmentTermTemplate}
            updateApi={inquiryConfigApi.updateAssignmentTermTemplate}
            deleteApi={inquiryConfigApi.deleteAssignmentTermTemplate}
          />
        </TabsContent>
        <TabsContent value="payment-terms" className="mt-4">
          <TermTemplatesSection<PaymentTermTemplate>
            title="Payment term templates"
            list={paymentTermTemplates}
            inquiryTypes={inquiryTypes}
            loading={loading}
            onReload={load}
            createApi={inquiryConfigApi.createPaymentTermTemplate}
            updateApi={inquiryConfigApi.updatePaymentTermTemplate}
            deleteApi={inquiryConfigApi.deletePaymentTermTemplate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InquiryTypesSection({
  list,
  loading,
  onReload,
}: {
  list: InquiryType[];
  loading: boolean;
  onReload: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InquiryType | null>(null);
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
  const openEdit = (row: InquiryType) => {
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
        await inquiryConfigApi.updateInquiryType(editing.id, {
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        await inquiryConfigApi.createInquiryType({
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
    if (!confirm("Delete this inquiry type?")) return;
    try {
      await inquiryConfigApi.deleteInquiryType(id);
      onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading) return <p className="text-muted-foreground py-8">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add inquiry type</Button>
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
        <p className="text-muted-foreground py-8 text-center">No inquiry types. Add one to get started.</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit inquiry type" : "Add inquiry type"}</DialogTitle>
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

function DocumentsSection({
  list,
  inquiryTypes,
  loading,
  onReload,
}: {
  list: DocumentMaster[];
  inquiryTypes: InquiryType[];
  loading: boolean;
  onReload: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentMaster | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assignmentTypeId, setAssignmentTypeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setAssignmentTypeId("");
    setErr(null);
    setDialogOpen(true);
  };
  const openEdit = (row: DocumentMaster) => {
    setEditing(row);
    setName(row.name);
    setDescription(row.description ?? "");
    setAssignmentTypeId(row.assignmentTypeId ?? "");
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
        assignmentTypeId: assignmentTypeId || null,
      };
      if (editing) {
        await inquiryConfigApi.updateDocument(editing.id, payload);
      } else {
        await inquiryConfigApi.createDocument(payload);
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
      await inquiryConfigApi.deleteDocument(id);
      onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const typeName = (id: string | null) => {
    if (!id) return "—";
    return inquiryTypes.find((t) => t.id === id)?.name ?? id;
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
            <TableHead>Inquiry type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.description ?? "—"}</TableCell>
              <TableCell>{typeName(row.assignmentTypeId)}</TableCell>
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
            <div className="grid gap-2">
              <Label htmlFor="doc-type">Inquiry type (optional)</Label>
              <select
                id="doc-type"
                value={assignmentTypeId}
                onChange={(e) => setAssignmentTypeId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Any —</option>
                {inquiryTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
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

function DocumentsPerInquiryTypeSection({
  documents,
  inquiryTypes,
  loading,
  onReload,
}: {
  documents: DocumentMaster[];
  inquiryTypes: InquiryType[];
  loading: boolean;
  onReload: () => void;
}) {
  const [selectedInquiryTypeId, setSelectedInquiryTypeId] = useState<string>("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDocumentId, setLinkDocumentId] = useState("");
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [linkErr, setLinkErr] = useState<string | null>(null);

  const linkedDocuments = selectedInquiryTypeId
    ? documents.filter((d) => d.assignmentTypeId === selectedInquiryTypeId)
    : [];
  const unlinkedOrOtherDocuments = selectedInquiryTypeId
    ? documents.filter((d) => d.assignmentTypeId !== selectedInquiryTypeId)
    : documents;

  const openLinkDialog = () => {
    setLinkDocumentId("");
    setLinkErr(null);
    setLinkDialogOpen(true);
  };
  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
    setLinkErr(null);
  };

  const linkDocument = async () => {
    if (!selectedInquiryTypeId) return;
    if (!linkDocumentId) {
      setLinkErr("Select a document to link");
      return;
    }
    setLinkSubmitting(true);
    setLinkErr(null);
    try {
      await inquiryConfigApi.updateDocument(linkDocumentId, {
        assignmentTypeId: selectedInquiryTypeId,
      });
      closeLinkDialog();
      onReload();
    } catch (e) {
      setLinkErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLinkSubmitting(false);
    }
  };

  const unlinkDocument = async (documentId: string) => {
    if (!confirm("Unlink this document from this inquiry type?")) return;
    try {
      await inquiryConfigApi.updateDocument(documentId, { assignmentTypeId: null });
      onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unlink failed");
    }
  };

  const selectedTypeName = selectedInquiryTypeId
    ? inquiryTypes.find((t) => t.id === selectedInquiryTypeId)?.name ?? "—"
    : "—";

  if (loading) return <p className="text-muted-foreground py-8">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 max-w-sm">
        <Label htmlFor="dpit-inquiry-type">Inquiry type</Label>
        <select
          id="dpit-inquiry-type"
          value={selectedInquiryTypeId}
          onChange={(e) => setSelectedInquiryTypeId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">— Select inquiry type —</option>
          {inquiryTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Select an inquiry type to see and manage which documents are needed for that type.
        </p>
      </div>

      {selectedInquiryTypeId && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Documents linked to &quot;{selectedTypeName}&quot;
            </p>
            <Button onClick={openLinkDialog}>Link document</Button>
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
              {linkedDocuments.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.description ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unlinkDocument(row.id)}
                    >
                      Unlink
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {linkedDocuments.length === 0 && (
            <p className="text-muted-foreground py-6 text-center">
              No documents linked. Use &quot;Link document&quot; to add documents needed for this inquiry type.
            </p>
          )}
        </>
      )}

      {!selectedInquiryTypeId && (
        <p className="text-muted-foreground py-8 text-center">
          Select an inquiry type above to see and manage documents needed for that type.
        </p>
      )}

      <Dialog open={linkDialogOpen} onOpenChange={(open) => !open && closeLinkDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link document to inquiry type</DialogTitle>
          </DialogHeader>
          {linkErr && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{linkErr}</div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-doc">Document</Label>
              <select
                id="link-doc"
                value={linkDocumentId}
                onChange={(e) => setLinkDocumentId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Select document —</option>
                {unlinkedOrOtherDocuments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.assignmentTypeId
                      ? ` (currently: ${inquiryTypes.find((t) => t.id === d.assignmentTypeId)?.name ?? "other"})`
                      : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Linking will set this document&apos;s inquiry type to &quot;{selectedTypeName}&quot;.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeLinkDialog}>
              Cancel
            </Button>
            <Button onClick={linkDocument} disabled={linkSubmitting}>
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TermTemplateRow {
  id: string;
  name: string;
  content: unknown;
  assignmentTypeId: string | null;
}

function TermTemplatesSection<T extends TermTemplateRow>({
  title,
  list,
  inquiryTypes,
  loading,
  onReload,
  createApi,
  updateApi,
  deleteApi,
}: {
  title: string;
  list: T[];
  inquiryTypes: InquiryType[];
  loading: boolean;
  onReload: () => void;
  createApi: (body: { name: string; content?: unknown; assignmentTypeId?: string | null }) => Promise<T>;
  updateApi: (id: string, body: { name?: string; content?: unknown; assignmentTypeId?: string | null }) => Promise<T>;
  deleteApi: (id: string) => Promise<{ deleted: boolean }>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [name, setName] = useState("");
  const [contentStr, setContentStr] = useState("");
  const [assignmentTypeId, setAssignmentTypeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setContentStr("");
    setAssignmentTypeId("");
    setErr(null);
    setDialogOpen(true);
  };
  const openEdit = (row: T) => {
    setEditing(row);
    setName(row.name);
    let initialContent = "";
    if (typeof row.content === "string") {
      initialContent = row.content;
    } else if (row.content != null) {
      initialContent = JSON.stringify(row.content, null, 2);
    }
    setContentStr(initialContent);
    setAssignmentTypeId(row.assignmentTypeId ?? "");
    setErr(null);
    setDialogOpen(true);
  };
  const close = () => {
    setDialogOpen(false);
    setErr(null);
  };

  const parseContent = (): unknown => {
    const s = contentStr.trim();
    if (!s) return null;
    try {
      return JSON.parse(s) as unknown;
    } catch {
      return s;
    }
  };

  const submit = async () => {
    if (!name.trim()) {
      setErr("Name is required");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const content = parseContent();
      const payload = {
        name: name.trim(),
        content: content ?? undefined,
        assignmentTypeId: assignmentTypeId || null,
      };
      if (editing) {
        await updateApi(editing.id, payload);
      } else {
        await createApi(payload);
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
    if (!confirm("Delete this template?")) return;
    try {
      await deleteApi(id);
      onReload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const typeName = (id: string | null) => {
    if (!id) return "—";
    return inquiryTypes.find((t) => t.id === id)?.name ?? id;
  };

  if (loading) return <p className="text-muted-foreground py-8">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add template</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Inquiry type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{typeName(row.assignmentTypeId)}</TableCell>
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
        <p className="text-muted-foreground py-8 text-center">No templates. Add one to get started.</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}</DialogTitle>
          </DialogHeader>
          {err && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{err}</div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="term-name">Name</Label>
              <Input
                id="term-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="term-content">Content (JSON or plain text)</Label>
              <Textarea
                id="term-content"
                value={contentStr}
                onChange={(e) => setContentStr(e.target.value)}
                placeholder='{"key": "value"} or plain text'
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="term-type">Inquiry type (optional)</Label>
              <select
                id="term-type"
                value={assignmentTypeId}
                onChange={(e) => setAssignmentTypeId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">— Any —</option>
                  {inquiryTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
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
