import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { inquiriesApi } from "@/api/inquiries.api";
import type { Inquiry, InquiryStatus } from "@/api/inquiries.api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Plus } from "lucide-react";

const STATUS_OPTIONS: { value: InquiryStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

function statusBadgeVariant(status: InquiryStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "ACCEPTED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "—";
  }
}

function canCreateInquiry(roleValue: string | undefined): boolean {
  return roleValue === "SUPER_ADMIN" || roleValue === "ADMIN" || roleValue === "MANAGER";
}

export default function Inquiries() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = (searchParams.get("status") as InquiryStatus) || undefined;
  const { user } = useAuth();
  const canCreate = canCreateInquiry(user?.roleValue);

  const { data: list = [], isLoading, error } = useQuery({
    queryKey: ["inquiries", statusFilter],
    queryFn: () => inquiriesApi.listInquiries(statusFilter),
  });
  const { data: inquiryTypes = [] } = useQuery({
    queryKey: ["inquiry-types"],
    queryFn: () => inquiriesApi.listInquiryTypes(),
  });
  const typeNameById = Object.fromEntries(inquiryTypes.map((t) => [t.id, t.name]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inquiry register</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage client inquiries from visit through accept or reject
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate("/inquiries/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New inquiry
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <Button
            key={value || "all"}
            variant={(!value && !statusFilter) || statusFilter === value ? "default" : "outline"}
            size="sm"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (value) next.set("status", value);
              else next.delete("status");
              setSearchParams(next);
            }}
          >
            {label}
          </Button>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error instanceof Error ? error.message : "Failed to load inquiries"}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        {isLoading && <div className="p-8 text-center text-muted-foreground">Loading…</div>}
        {!isLoading && list.length === 0 && (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <FileQuestion className="h-10 w-10" />
            <span>No inquiries found.</span>
            {canCreate && (
              <Button variant="outline" size="sm" onClick={() => navigate("/inquiries/new")}>
                Create first inquiry
              </Button>
            )}
          </div>
        )}
        {!isLoading && list.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((inquiry: Inquiry) => (
                <TableRow
                  key={inquiry.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/inquiries/${inquiry.id}`)}
                >
                  <TableCell className="font-medium">
                    {inquiry.contactName || inquiry.contactEmail || "—"}
                  </TableCell>
                  <TableCell>{typeNameById[inquiry.assignmentTypeId] ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(inquiry.status)}>{inquiry.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(inquiry.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/inquiries/${inquiry.id}`);
                      }}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
