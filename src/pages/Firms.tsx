import { useQuery } from "@tanstack/react-query";
import { firmsApi, type Firm } from "@/api/firms.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "—";
  }
}

function contactSummary(firm: Firm): string {
  const parts: string[] = [];
  if (firm.email) parts.push(firm.email);
  if (firm.phoneNumber) {
    const phone = firm.phoneCountryCode
      ? `${firm.phoneCountryCode} ${firm.phoneNumber}`
      : firm.phoneNumber;
    parts.push(phone);
  }
  return parts.length ? parts.join(" · ") : "—";
}

export default function Firms() {
  const { data: firms = [], isLoading } = useQuery({
    queryKey: ["firms"],
    queryFn: () => firmsApi.listFirms(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Firms</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View all firms in the workspace.
        </p>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-8 text-center">
          Loading...
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>PAN / GST</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {firms.map((firm) => (
              <TableRow key={firm.id}>
                <TableCell className="font-medium">{firm.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {firm.description ?? "—"}
                </TableCell>
                <TableCell className="max-w-[220px] truncate">
                  {contactSummary(firm)}
                </TableCell>
                <TableCell>
                  {[firm.pan, firm.gst].filter(Boolean).join(" / ") || "—"}
                </TableCell>
                <TableCell>{formatDate(firm.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && firms.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          No firms yet.
        </div>
      )}
    </div>
  );
}
