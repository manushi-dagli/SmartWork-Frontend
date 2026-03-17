import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskRequestsApi } from "@/api/taskRequests.api";
import type { TaskType, SubtaskWithTask } from "@/api/taskRequests.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MessageCircle, CheckCircle, XCircle, FileUp, Download, Trash2 } from "lucide-react";
import { store } from "@/store";
import { contactDetailsSchema } from "@/lib/validations";

const SUBTASK_NONE_VALUE = "__none__";

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" {
  if (status === "ACCEPTED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary";
}

export default function InquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhoneCountryCode, setContactPhoneCountryCode] = useState("");
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");
  const [contactPhone2CountryCode, setContactPhone2CountryCode] = useState("");
  const [contactPhone2Number, setContactPhone2Number] = useState("");
  const [taskId, setTaskId] = useState("");
  const [subtaskId, setSubtaskId] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [assignmentTerms, setAssignmentTerms] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [paymentCost, setPaymentCost] = useState("");
  const [saved, setSaved] = useState(false);
  const [contactErrors, setContactErrors] = useState<{
    contactName?: string;
    contactEmail?: string;
    contactPhoneCountryCode?: string;
    contactPhoneNumber?: string;
    contactPhone2CountryCode?: string;
    contactPhone2Number?: string;
  }>({});

  const taskRequestId = id ?? "";

  const { data: taskRequest, isLoading: taskRequestLoading, error: taskRequestError } = useQuery({
    queryKey: ["task-request", taskRequestId],
    queryFn: () => taskRequestsApi.getTaskRequest(taskRequestId),
    enabled: !!taskRequestId && taskRequestId !== "new",
  });

  const { data: taskTypes = [] } = useQuery({
    queryKey: ["task-types"],
    queryFn: () => taskRequestsApi.listTaskTypes(),
  });
  const { data: subtasksWithTask = [] } = useQuery({
    queryKey: ["subtasks-with-task"],
    queryFn: () => taskRequestsApi.listSubtasksWithTask(),
  });
  const { data: allDocuments = [], isLoading: docsLoading } = useQuery({
    queryKey: ["documents-master"],
    queryFn: () => taskRequestsApi.listDocuments(),
  });

  useEffect(() => {
    if (taskRequest) {
      setContactName(taskRequest.contactName ?? "");
      setContactEmail(taskRequest.contactEmail ?? "");
      setContactPhoneCountryCode(taskRequest.contactPhoneCountryCode ?? "");
      setContactPhoneNumber(taskRequest.contactPhoneNumber ?? "");
      setContactPhone2CountryCode(taskRequest.contactPhone2CountryCode ?? "");
      setContactPhone2Number(taskRequest.contactPhone2Number ?? "");
      setTaskId(taskRequest.taskId);
      setSubtaskId(taskRequest.subtaskId ?? "");
      setSelectedDocIds(new Set(taskRequest.documentIds ?? []));
      setAssignmentTerms(taskRequest.assignmentTerms ?? "");
      setPaymentTerms(taskRequest.paymentTerms ?? "");
      setPaymentCost(taskRequest.paymentCost ?? "");
    }
  }, [taskRequest]);

  const updateTaskRequest = useMutation({
    mutationFn: (payload: {
      contactName?: string | null;
      contactEmail?: string | null;
      contactPhoneCountryCode?: string | null;
      contactPhoneNumber?: string | null;
      contactPhone2CountryCode?: string | null;
      contactPhone2Number?: string | null;
      taskId?: string;
      subtaskId?: string | null;
      assignmentTerms?: string | null;
      paymentTerms?: string | null;
      paymentCost?: string | null;
    }) => taskRequestsApi.updateTaskRequest(taskRequestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-request", taskRequestId] });
      setSaved(true);
    },
  });

  const setDocuments = useMutation({
    mutationFn: (documentMasterIds: string[]) =>
      taskRequestsApi.setTaskRequestDocuments(taskRequestId, documentMasterIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-request", taskRequestId] }),
  });

  const uploadAttachment = useMutation({
    mutationFn: (file: File) => taskRequestsApi.uploadAttachment(taskRequestId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-request", taskRequestId] }),
  });

  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) => taskRequestsApi.deleteAttachment(taskRequestId, attachmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-request", taskRequestId] }),
  });

  const markSent = useMutation({
    mutationFn: (opts: { emailed?: boolean; whatsapp?: boolean }) =>
      taskRequestsApi.markSent(taskRequestId, opts),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-request", taskRequestId] }),
  });

  const acceptMutation = useMutation({
    mutationFn: () => taskRequestsApi.acceptTaskRequest(taskRequestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-request", taskRequestId] }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => taskRequestsApi.rejectTaskRequest(taskRequestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task-request", taskRequestId] }),
  });

  const isPending = taskRequest?.status === "PENDING";
  const canEdit = isPending && !taskRequest?.clientId;

  const hasContact =
    (contactName?.trim() ?? "") !== "" &&
    ((contactEmail?.trim() ?? "") !== "" ||
      ((contactPhoneCountryCode?.trim() ?? "") !== "" && (contactPhoneNumber?.trim() ?? "") !== ""));
  const hasTask = (taskId?.trim() ?? "") !== "";
  const hasAttachments = (taskRequest?.attachments?.length ?? 0) > 0;
  const canSendEmailWhatsApp = canEdit && hasContact && hasTask && hasAttachments;

  const handleSaveContact = () => {
    setContactErrors({});
    const result = contactDetailsSchema.safeParse({
      contactName: contactName.trim() || "",
      contactEmail: contactEmail.trim() || "",
      contactPhoneCountryCode: contactPhoneCountryCode.trim() || "",
      contactPhoneNumber: contactPhoneNumber.trim() || "",
      contactPhone2CountryCode: contactPhone2CountryCode.trim() || "",
      contactPhone2Number: contactPhone2Number.trim() || "",
    });
    if (!result.success) {
      const err = result.error.flatten().fieldErrors;
      setContactErrors({
        contactName: err.contactName?.[0],
        contactEmail: err.contactEmail?.[0],
        contactPhoneCountryCode: err.contactPhoneCountryCode?.[0],
        contactPhoneNumber: err.contactPhoneNumber?.[0],
        contactPhone2CountryCode: err.contactPhone2CountryCode?.[0],
        contactPhone2Number: err.contactPhone2Number?.[0],
      });
      return;
    }
    const data = result.data;
    updateTaskRequest.mutate({
      contactName: data.contactName ?? null,
      contactEmail: data.contactEmail ?? null,
      contactPhoneCountryCode: data.contactPhoneCountryCode ?? null,
      contactPhoneNumber: data.contactPhoneNumber ?? null,
      contactPhone2CountryCode: data.contactPhone2CountryCode ?? null,
      contactPhone2Number: data.contactPhone2Number ?? null,
    });
  };

  const handleSaveType = () => {
    updateTaskRequest.mutate({
      taskId: taskId || undefined,
      subtaskId: subtaskId || null,
    });
  };

  const handleAttachDocuments = () => {
    setDocuments.mutate(Array.from(selectedDocIds));
  };

  const handleSaveTerms = () => {
    updateTaskRequest.mutate({
      assignmentTerms: assignmentTerms.trim() || null,
      paymentTerms: paymentTerms.trim() || null,
      paymentCost: paymentCost.trim() || null,
    });
  };

  if (!taskRequestId || taskRequestId === "new") {
    navigate("/inquiries", { replace: true });
    return null;
  }

  if (taskRequestLoading || !taskRequest) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/inquiries")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="p-8 text-center text-muted-foreground">
          {taskRequestError ? "Inquiry not found." : "Loading…"}
        </div>
      </div>
    );
  }

  const toggleDoc = (docId: string) => {
    const next = new Set(selectedDocIds);
    if (next.has(docId)) next.delete(docId);
    else next.add(docId);
    setSelectedDocIds(next);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/inquiries")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {taskRequest.contactName || taskRequest.contactEmail || "Inquiry"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(taskRequest.status)}>
                {taskRequest.status}
              </Badge>
              {saved && <span className="text-green-600 text-xs">Saved</span>}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client details</CardTitle>
          <CardDescription>Contact name, email, and phone (editable until accept).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Contact name</Label>
              <Input
                value={contactName}
                onChange={(e) => { setContactName(e.target.value); setContactErrors((p) => ({ ...p, contactName: undefined })); }}
                disabled={!canEdit}
                placeholder="Full name"
              />
              {contactErrors.contactName && (
                <p className="text-sm font-medium text-destructive">{contactErrors.contactName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => { setContactEmail(e.target.value); setContactErrors((p) => ({ ...p, contactEmail: undefined })); }}
                disabled={!canEdit}
                placeholder="email@example.com"
              />
              {contactErrors.contactEmail && (
                <p className="text-sm font-medium text-destructive">{contactErrors.contactEmail}</p>
              )}
            </div>
            <p className="text-sm text-muted-foreground col-span-full">
              Use a number with a WhatsApp account. You can add a second contact number (optional).
            </p>
            <div className="space-y-2">
              <Label>Phone 1</Label>
              <div className="flex gap-2">
                <Input
                  value={contactPhoneCountryCode}
                  onChange={(e) => { setContactPhoneCountryCode(e.target.value); setContactErrors((p) => ({ ...p, contactPhoneCountryCode: undefined })); }}
                  disabled={!canEdit}
                  placeholder="+91"
                  className="w-20"
                  maxLength={4}
                />
                <Input
                  value={contactPhoneNumber}
                  onChange={(e) => { setContactPhoneNumber(e.target.value); setContactErrors((p) => ({ ...p, contactPhoneNumber: undefined })); }}
                  disabled={!canEdit}
                  placeholder="10-digit number"
                  maxLength={10}
                />
              </div>
              {(contactErrors.contactPhoneCountryCode || contactErrors.contactPhoneNumber) && (
                <p className="text-sm font-medium text-destructive">
                  {contactErrors.contactPhoneCountryCode || contactErrors.contactPhoneNumber}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Phone 2 (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={contactPhone2CountryCode}
                  onChange={(e) => { setContactPhone2CountryCode(e.target.value); setContactErrors((p) => ({ ...p, contactPhone2CountryCode: undefined })); }}
                  disabled={!canEdit}
                  placeholder="+91"
                  className="w-20"
                  maxLength={4}
                />
                <Input
                  value={contactPhone2Number}
                  onChange={(e) => { setContactPhone2Number(e.target.value); setContactErrors((p) => ({ ...p, contactPhone2Number: undefined })); }}
                  disabled={!canEdit}
                  placeholder="10-digit number"
                  maxLength={10}
                />
              </div>
              {(contactErrors.contactPhone2CountryCode || contactErrors.contactPhone2Number) && (
                <p className="text-sm font-medium text-destructive">
                  {contactErrors.contactPhone2CountryCode || contactErrors.contactPhone2Number}
                </p>
              )}
            </div>
          </div>
          {canEdit && (
            <Button onClick={handleSaveContact} disabled={updateTaskRequest.isPending}>
              Save contact details
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task (service)</CardTitle>
          <CardDescription>Which service this inquiry is for. Select a subtask — task is set automatically and is read-only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Subtask (optional)</Label>
            <Select
              value={subtaskId && subtaskId.trim() !== "" ? subtaskId : SUBTASK_NONE_VALUE}
              onValueChange={(val) => {
                const actual = val === SUBTASK_NONE_VALUE ? "" : (val ?? "");
                setSubtaskId(actual);
                const sub = (subtasksWithTask as SubtaskWithTask[]).find((s) => s.id === actual);
                if (sub) setTaskId(sub.taskId);
              }}
              disabled={!canEdit}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select subtask — task will auto-fill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SUBTASK_NONE_VALUE}>— None —</SelectItem>
                {(subtasksWithTask as SubtaskWithTask[]).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.taskName} — {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Task (read-only)</Label>
            <p className="text-sm py-2 px-3 rounded-md border bg-muted/50 text-muted-foreground max-w-md">
              {(() => {
                const sub = (subtasksWithTask as SubtaskWithTask[]).find((s) => s.id === subtaskId);
                if (sub) return sub.taskName;
                const task = taskTypes.find((t: TaskType) => t.id === taskId);
                return task?.name ?? (taskId ? "—" : "Select a subtask to set task");
              })()}
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleSaveType} disabled={updateTaskRequest.isPending}>
              Save task
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document checklist</CardTitle>
          <CardDescription>
            Documents from master list. Check and attach to inquiry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {docsLoading && <p className="text-muted-foreground text-sm">Loading documents…</p>}
          {!docsLoading && allDocuments.length === 0 && (
            <p className="text-muted-foreground text-sm">No documents in master list.</p>
          )}
          {!docsLoading && allDocuments.length > 0 && (
            <>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`doc-${doc.id}`}
                      checked={selectedDocIds.has(doc.id)}
                      onCheckedChange={() => toggleDoc(doc.id)}
                      disabled={!canEdit}
                    />
                    <Label htmlFor={`doc-${doc.id}`} className="font-normal cursor-pointer">
                      {doc.name}
                      {doc.description && (
                        <span className="text-muted-foreground text-xs ml-1">— {doc.description}</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
              {canEdit && (
                <Button
                  onClick={handleAttachDocuments}
                  disabled={setDocuments.isPending}
                >
                  Attach selected documents
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attached files</CardTitle>
          <CardDescription>
            Images or PDFs saved with this inquiry. At least one attachment is required before you can mark email/WhatsApp as sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(taskRequest?.attachments?.length ?? 0) === 0 && !canEdit && (
            <p className="text-muted-foreground text-sm">No files attached.</p>
          )}
          {(taskRequest?.attachments?.length ?? 0) > 0 && (
            <ul className="space-y-2">
              {(taskRequest?.attachments ?? []).map((att) => (
                <li
                  key={att.id}
                  className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
                >
                  <span className="truncate">{att.fileName}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={async () => {
                        const baseUrl = import.meta.env.VITE_API_URL ?? "";
                        const url = `${baseUrl}/api/task-requests/${taskRequestId}/attachments/${att.id}/file`;
                        const token = store.getState().auth.accessToken;
                        const res = await fetch(url, {
                          credentials: "include",
                          headers: token ? { Authorization: `Bearer ${token}` } : {},
                        });
                        if (!res.ok) return;
                        const blob = await res.blob();
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = att.fileName;
                        a.click();
                        URL.revokeObjectURL(a.href);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-destructive hover:text-destructive"
                        onClick={() => deleteAttachment.mutate(att.id)}
                        disabled={deleteAttachment.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {canEdit && (
            <label className="flex items-center justify-center gap-2 rounded-md border border-dashed p-3 cursor-pointer hover:bg-muted/50 text-sm text-muted-foreground">
              <FileUp className="h-4 w-4" />
              Add file (image or PDF, max 5MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAttachment.mutate(file);
                  e.target.value = "";
                }}
                disabled={uploadAttachment.isPending}
              />
            </label>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
          <CardDescription>Assignment terms, payment terms, and payment/cost (per inquiry).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Assignment terms</Label>
            <Textarea
              value={assignmentTerms}
              onChange={(e) => setAssignmentTerms(e.target.value)}
              disabled={!canEdit}
              placeholder="Assignment terms for this inquiry"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Payment terms</Label>
            <Textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              disabled={!canEdit}
              placeholder="Payment terms for this inquiry"
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Payment / cost</Label>
            <Input
              value={paymentCost}
              onChange={(e) => setPaymentCost(e.target.value)}
              disabled={!canEdit}
              placeholder="e.g. INR or Rupees"
            />
          </div>
          {canEdit && (
            <Button onClick={handleSaveTerms} disabled={updateTaskRequest.isPending}>
              Save terms
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send to client</CardTitle>
          <CardDescription>
            Mark when email or WhatsApp was sent (no actual send in app). Enable by filling contact, task, and at least one attached file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {!canSendEmailWhatsApp && canEdit && (
            <p className="text-sm text-muted-foreground">
              Fill in contact details, select a subtask (task), and attach at least one file to enable sending.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markSent.mutate({ emailed: true })}
              disabled={!canSendEmailWhatsApp || markSent.isPending}
            >
              <Mail className="h-4 w-4 mr-2" />
              Mark as sent (Email)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markSent.mutate({ whatsapp: true })}
              disabled={!canSendEmailWhatsApp || markSent.isPending}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Mark as sent (WhatsApp)
            </Button>
          </div>
          {(taskRequest?.emailedAt || taskRequest?.whatsappSentAt) && (
            <span className="text-muted-foreground text-sm block">
              {taskRequest?.emailedAt && "Email sent " + new Date(taskRequest.emailedAt).toLocaleString()}
              {taskRequest?.emailedAt && taskRequest?.whatsappSentAt && " · "}
              {taskRequest?.whatsappSentAt && "WhatsApp sent " + new Date(taskRequest.whatsappSentAt).toLocaleString()}
            </span>
          )}
        </CardContent>
      </Card>

      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Client decision</CardTitle>
            <CardDescription>Accept creates a client and links this inquiry; Reject sets status to Rejected.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending || rejectMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate()}
              disabled={acceptMutation.isPending || rejectMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            {(acceptMutation.error || rejectMutation.error) && (
              <span className="text-destructive text-sm self-center">
                {(() => {
                  const err = acceptMutation.error || rejectMutation.error;
                  return err instanceof Error ? err.message : "Action failed";
                })()}
              </span>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
