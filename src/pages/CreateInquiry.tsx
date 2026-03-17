import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskRequestsApi, type SubtaskWithTask } from "@/api/taskRequests.api";
import { firmsApi } from "@/api/firms.api";
import { createTaskRequestFormSchema, type CreateTaskRequestFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ChevronDown, FileUp, X } from "lucide-react";

const SUBTASK_NONE_VALUE = "__none__";

export default function CreateInquiry() {
  const navigate = useNavigate();
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  const form = useForm<CreateTaskRequestFormValues>({
    resolver: zodResolver(createTaskRequestFormSchema),
    defaultValues: {
      firmId: "",
      taskId: "",
      subtaskId: "",
      contactName: "",
      contactEmail: "",
      contactPhoneCountryCode: "",
      contactPhoneNumber: "",
      contactPhone2CountryCode: "",
      contactPhone2Number: "",
      assignmentTerms: "",
      paymentTerms: "",
      paymentCost: "",
    },
  });

  const { data: firms = [], isLoading: firmsLoading } = useQuery({
    queryKey: ["firms"],
    queryFn: () => firmsApi.listFirms(),
  });
  const { data: subtasksWithTask = [], isLoading: subtasksLoading } = useQuery({
    queryKey: ["subtasks-with-task"],
    queryFn: () => taskRequestsApi.listSubtasksWithTask(),
  });
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ["documents-master"],
    queryFn: () => taskRequestsApi.listDocuments(),
    enabled: documentsOpen,
  });

  const selectedSubtask = (subtasksWithTask as SubtaskWithTask[]).find(
    (s) => s.id === form.watch("subtaskId")
  );
  const taskName = selectedSubtask?.taskName ?? null;

  const onSubmit = async (values: CreateTaskRequestFormValues) => {
    try {
      const taskRequest = await taskRequestsApi.createTaskRequest({
        firmId: values.firmId?.trim() || null,
        taskId: values.taskId,
        subtaskId: values.subtaskId?.trim() || null,
        contactName: values.contactName?.trim() || null,
        contactEmail: values.contactEmail?.trim() || null,
        contactPhoneCountryCode: values.contactPhoneCountryCode ?? null,
        contactPhoneNumber: values.contactPhoneNumber ?? null,
        contactPhone2CountryCode: values.contactPhone2CountryCode ?? null,
        contactPhone2Number: values.contactPhone2Number ?? null,
        assignmentTerms: values.assignmentTerms?.trim() || null,
        paymentTerms: values.paymentTerms?.trim() || null,
        paymentCost: values.paymentCost?.trim() || null,
      });
      if (selectedDocIds.size > 0) {
        await taskRequestsApi.setTaskRequestDocuments(taskRequest.id, Array.from(selectedDocIds));
      }
      for (const file of attachmentFiles) {
        await taskRequestsApi.uploadAttachment(taskRequest.id, file);
      }
      navigate(`/inquiries/${taskRequest.id}`, { replace: true });
    } catch (err) {
      form.setError("root", { message: err instanceof Error ? err.message : "Failed to create inquiry" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/inquiries")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New inquiry</h1>
          <p className="text-muted-foreground text-sm mt-1">Client is asking for a service — create an inquiry and select the task (service) they need.</p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Inquiry details</CardTitle>
          <CardDescription>Enter client details first, then subtask, documents, and terms.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}
              <FormField
                control={form.control}
                name="firmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm (optional)</FormLabel>
                    <Select
                      value={field.value && field.value.trim() !== "" ? field.value : "__none__"}
                      onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)}
                      disabled={firmsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select firm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">— No firm —</SelectItem>
                        {firms.map((firm) => (
                          <SelectItem key={firm.id} value={firm.id}>
                            {firm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-sm text-muted-foreground">
                Use a number with a WhatsApp account. You can add a second contact number (optional).
              </p>
              <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
                <FormField
                  control={form.control}
                  name="contactPhoneCountryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone 1</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+91" className="w-20" maxLength={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="opacity-0">Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="10-digit number" maxLength={10} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
                <FormField
                  control={form.control}
                  name="contactPhone2CountryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Phone 2 (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+91" className="w-20" maxLength={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone2Number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="opacity-0">Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="10-digit number" maxLength={10} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="subtaskId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtask *</FormLabel>
                    <Select
                      value={field.value && field.value.trim() !== "" ? field.value : SUBTASK_NONE_VALUE}
                      onValueChange={(val) => {
                        const actual = val === SUBTASK_NONE_VALUE ? "" : val;
                        field.onChange(actual);
                        const sub = (subtasksWithTask as SubtaskWithTask[]).find((s) => s.id === actual);
                        if (sub) form.setValue("taskId", sub.taskId);
                      }}
                      disabled={subtasksLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subtask (task is set automatically)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SUBTASK_NONE_VALUE}>— Select subtask —</SelectItem>
                        {(subtasksWithTask as SubtaskWithTask[]).map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.taskName} — {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {taskName && (
                <div className="space-y-1">
                  <FormLabel>Task (read-only)</FormLabel>
                  <p className="text-sm py-2 px-3 rounded-md border bg-muted/50 text-muted-foreground">
                    {taskName}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <FormLabel>Documents (optional)</FormLabel>
                <Popover open={documentsOpen} onOpenChange={setDocumentsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedDocIds.size === 0
                        ? "Select documents"
                        : `${selectedDocIds.size} document(s) selected`}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] max-h-64 overflow-hidden flex flex-col p-0" align="start">
                    {docsLoading && (
                      <p className="p-3 text-sm text-muted-foreground">Loading documents…</p>
                    )}
                    {!docsLoading && documents.length === 0 && (
                      <p className="p-3 text-sm text-muted-foreground">No documents in master list.</p>
                    )}
                    {!docsLoading && documents.length > 0 && (
                      <div className="p-2 overflow-y-auto space-y-2">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`doc-${doc.id}`}
                              checked={selectedDocIds.has(doc.id)}
                              onCheckedChange={(checked) => {
                                setSelectedDocIds((prev) => {
                                  const next = new Set(prev);
                                  if (checked) next.add(doc.id);
                                  else next.delete(doc.id);
                                  return next;
                                });
                              }}
                            />
                            <label
                              htmlFor={`doc-${doc.id}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {doc.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <FormLabel>Attach files (images or PDF, optional)</FormLabel>
                <p className="text-sm text-muted-foreground">Upload documents to save with the inquiry. Max 5MB per file. Allowed: JPEG, PNG, WebP, PDF.</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center justify-center gap-2 rounded-md border border-dashed p-4 cursor-pointer hover:bg-muted/50">
                    <FileUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Choose files to attach</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        setAttachmentFiles((prev) => [...prev, ...files]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {attachmentFiles.length > 0 && (
                    <ul className="rounded-md border divide-y text-sm">
                      {attachmentFiles.map((file, i) => (
                        <li key={`${file.name}-${i}`} className="flex items-center justify-between px-3 py-2">
                          <span className="truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => setAttachmentFiles((prev) => prev.filter((_, j) => j !== i))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <FormField
                control={form.control}
                name="assignmentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment terms (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Assignment terms for this inquiry"
                        rows={3}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment terms (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Payment terms for this inquiry"
                        rows={3}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment / cost (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. INR or Rupees"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creating…" : "Create inquiry"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/inquiries")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
