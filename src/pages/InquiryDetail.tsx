import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inquiriesApi } from "@/api/inquiries.api";
import type {
  DocumentForInquiry,
  InquiryType,
  AssignmentTermTemplate,
  PaymentTermTemplate,
} from "@/api/inquiries.api";
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
import { ArrowLeft, Mail, MessageCircle, CheckCircle, XCircle } from "lucide-react";
import { contactDetailsSchema } from "@/lib/validations";

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
  const [assignmentTypeId, setAssignmentTypeId] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [assignmentTermTemplateId, setAssignmentTermTemplateId] = useState<string | null>(null);
  const [paymentTermTemplateId, setPaymentTermTemplateId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [contactErrors, setContactErrors] = useState<{
    contactName?: string;
    contactEmail?: string;
    contactPhoneCountryCode?: string;
    contactPhoneNumber?: string;
    contactPhone2CountryCode?: string;
    contactPhone2Number?: string;
  }>({});

  const inquiryId = id ?? "";

  const { data: inquiry, isLoading: inquiryLoading, error: inquiryError } = useQuery({
    queryKey: ["inquiry", inquiryId],
    queryFn: () => inquiriesApi.getInquiry(inquiryId),
    enabled: !!inquiryId && inquiryId !== "new",
  });

  const { data: inquiryTypes = [] } = useQuery({
    queryKey: ["inquiry-types"],
    queryFn: () => inquiriesApi.listInquiryTypes(),
  });
  const { data: docsForType = [], isLoading: docsLoading } = useQuery({
    queryKey: ["inquiry-documents-by-type", assignmentTypeId],
    queryFn: () => inquiriesApi.getDocumentsByInquiryType(assignmentTypeId),
    enabled: !!assignmentTypeId,
  });
  const { data: assignmentTemplates = [] } = useQuery({
    queryKey: ["assignment-term-templates"],
    queryFn: () => inquiriesApi.listAssignmentTermTemplates(),
  });
  const { data: paymentTemplates = [] } = useQuery({
    queryKey: ["payment-term-templates"],
    queryFn: () => inquiriesApi.listPaymentTermTemplates(),
  });

  // Sync local state when inquiry loads
  useEffect(() => {
    if (inquiry) {
      setContactName(inquiry.contactName ?? "");
      setContactEmail(inquiry.contactEmail ?? "");
      setContactPhoneCountryCode(inquiry.contactPhoneCountryCode ?? "");
      setContactPhoneNumber(inquiry.contactPhoneNumber ?? "");
      setContactPhone2CountryCode(inquiry.contactPhone2CountryCode ?? "");
      setContactPhone2Number(inquiry.contactPhone2Number ?? "");
      setAssignmentTypeId(inquiry.assignmentTypeId);
      setSelectedDocIds(new Set(inquiry.documentIds ?? []));
      setAssignmentTermTemplateId(inquiry.assignmentTermTemplateId ?? null);
      setPaymentTermTemplateId(inquiry.paymentTermTemplateId ?? null);
    }
  }, [inquiry]);

  const updateInquiry = useMutation({
    mutationFn: (payload: {
      contactName?: string | null;
      contactEmail?: string | null;
      contactPhoneCountryCode?: string | null;
      contactPhoneNumber?: string | null;
      contactPhone2CountryCode?: string | null;
      contactPhone2Number?: string | null;
      assignmentTypeId?: string;
      assignmentTermTemplateId?: string | null;
      paymentTermTemplateId?: string | null;
    }) => inquiriesApi.updateInquiry(inquiryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] });
      setSaved(true);
    },
  });

  const setDocuments = useMutation({
    mutationFn: (documentMasterIds: string[]) =>
      inquiriesApi.setInquiryDocuments(inquiryId, documentMasterIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] }),
  });

  const markSent = useMutation({
    mutationFn: (opts: { emailed?: boolean; whatsapp?: boolean }) =>
      inquiriesApi.markSent(inquiryId, opts),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] }),
  });

  const acceptMutation = useMutation({
    mutationFn: () => inquiriesApi.acceptInquiry(inquiryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => inquiriesApi.rejectInquiry(inquiryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inquiry", inquiryId] }),
  });

  const isPending = inquiry?.status === "PENDING";
  const canEdit = isPending && !inquiry?.clientId;

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
    updateInquiry.mutate({
      contactName: data.contactName ?? null,
      contactEmail: data.contactEmail ?? null,
      contactPhoneCountryCode: data.contactPhoneCountryCode ?? null,
      contactPhoneNumber: data.contactPhoneNumber ?? null,
      contactPhone2CountryCode: data.contactPhone2CountryCode ?? null,
      contactPhone2Number: data.contactPhone2Number ?? null,
    });
  };

  const handleSaveType = () => {
    updateInquiry.mutate({ assignmentTypeId: assignmentTypeId || undefined });
  };

  const handleAttachDocuments = () => {
    setDocuments.mutate(Array.from(selectedDocIds));
  };

  const handleSaveTerms = () => {
    updateInquiry.mutate({
      assignmentTermTemplateId: assignmentTermTemplateId ?? null,
      paymentTermTemplateId: paymentTermTemplateId ?? null,
    });
  };

  if (!inquiryId || inquiryId === "new") {
    navigate("/inquiries", { replace: true });
    return null;
  }

  if (inquiryLoading || !inquiry) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/inquiries")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="p-8 text-center text-muted-foreground">
          {inquiryError ? "Inquiry not found." : "Loading…"}
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
              {inquiry.contactName || inquiry.contactEmail || "Inquiry"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                {inquiry.status}
              </Badge>
              {saved && <span className="text-green-600 text-xs">Saved</span>}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Client details */}
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
            <Button onClick={handleSaveContact} disabled={updateInquiry.isPending}>
              Save contact details
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 2. Inquiry type */}
      <Card>
        <CardHeader>
          <CardTitle>Inquiry type</CardTitle>
          <CardDescription>Select the type of inquiry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={assignmentTypeId}
            onValueChange={setAssignmentTypeId}
            disabled={!canEdit || inquiryTypes.length === 0}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {inquiryTypes.map((t: InquiryType) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canEdit && (
            <Button onClick={handleSaveType} disabled={updateInquiry.isPending}>
              Save inquiry type
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 3. Document checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Document checklist</CardTitle>
          <CardDescription>
            Documents for this inquiry type. Check and attach to inquiry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {docsLoading && <p className="text-muted-foreground text-sm">Loading documents…</p>}
          {!docsLoading && docsForType.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Select an inquiry type to see documents, or none are configured.
            </p>
          )}
          {!docsLoading && docsForType.length > 0 && (
            <>
              <div className="space-y-2">
                {docsForType.map((doc: DocumentForInquiry) => (
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

      {/* 4. Assignment & payment terms */}
      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
          <CardDescription>Assignment and payment term templates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Assignment terms</Label>
              <Select
                value={assignmentTermTemplateId ?? ""}
                onValueChange={(v) => setAssignmentTermTemplateId(v || null)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {assignmentTemplates.map((t: AssignmentTermTemplate) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment terms</Label>
              <Select
                value={paymentTermTemplateId ?? ""}
                onValueChange={(v) => setPaymentTermTemplateId(v || null)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTemplates.map((t: PaymentTermTemplate) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {canEdit && (
            <Button onClick={handleSaveTerms} disabled={updateInquiry.isPending}>
              Save terms
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 5. Send to client */}
      <Card>
        <CardHeader>
          <CardTitle>Send to client</CardTitle>
          <CardDescription>Mark when email or WhatsApp was sent (no actual send in app).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markSent.mutate({ emailed: true })}
            disabled={!canEdit || markSent.isPending}
          >
            <Mail className="h-4 w-4 mr-2" />
            Mark as sent (Email)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markSent.mutate({ whatsapp: true })}
            disabled={!canEdit || markSent.isPending}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Mark as sent (WhatsApp)
          </Button>
          {(inquiry.emailedAt || inquiry.whatsappSentAt) && (
            <span className="text-muted-foreground text-sm self-center">
              {inquiry.emailedAt && "Email sent " + new Date(inquiry.emailedAt).toLocaleString()}
              {inquiry.emailedAt && inquiry.whatsappSentAt && " · "}
              {inquiry.whatsappSentAt && "WhatsApp sent " + new Date(inquiry.whatsappSentAt).toLocaleString()}
            </span>
          )}
        </CardContent>
      </Card>

      {/* 6. Client decision */}
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
