import { useQuery } from "@tanstack/react-query";
import {
  analyticsApi,
  type ClientAnalyticsRow,
  type FirmAnalyticsRow,
} from "@/api/analytics.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

function formatCurrency(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}

export default function Analytics() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => analyticsApi.getSummary(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Detailed insights into firms, clients, tasks, and revenue.
          </p>
        </div>
        <div className="text-muted-foreground py-12 text-center">Loading analytics…</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Detailed insights into firms, clients, tasks, and revenue.
          </p>
        </div>
        <div className="text-muted-foreground py-12 text-center">Failed to load analytics.</div>
      </div>
    );
  }

  const { byClient, byFirm } = summary;
  const totalRevenue = byClient.reduce((s, c) => s + c.totalRevenue, 0);
  const totalCharged = byClient.reduce((s, c) => s + c.totalCharged, 0);
  const totalAssignments = byClient.reduce((s, c) => s + c.assignmentCount, 0);

  const revenueByClientChart = byClient
    .filter((c) => c.totalRevenue > 0 || c.totalCharged > 0)
    .slice(0, 15)
    .map((c) => ({
      name: c.clientName.length > 12 ? c.clientName.slice(0, 12) + "…" : c.clientName,
      revenue: c.totalRevenue,
      charged: c.totalCharged,
    }));

  const revenueByFirmChart = byFirm
    .filter((f) => f.firmId !== "__no_firm__" && (f.totalRevenue > 0 || f.totalCharged > 0))
    .map((f) => ({
      name: f.firmName.length > 12 ? f.firmName.slice(0, 12) + "…" : f.firmName,
      revenue: f.totalRevenue,
      charged: f.totalCharged,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed insights into firms, clients, tasks, and revenue.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Firms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{byFirm.filter((f) => f.firmId !== "__no_firm__").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{byClient.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAssignments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total charged</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalCharged)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {revenueByClientChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by client (top 15)</CardTitle>
            <p className="text-sm text-muted-foreground">Charged vs received per client.</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByClientChart} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1e5 ? `${v / 1e5}L` : `${v}`)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="charged" fill="hsl(var(--muted-foreground))" name="Charged" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {revenueByFirmChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by firm</CardTitle>
            <p className="text-sm text-muted-foreground">Charged vs received per firm.</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueByFirmChart} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1e5 ? `${v / 1e5}L` : `${v}`)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="charged" fill="hsl(var(--muted-foreground))" name="Charged" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="by-firm" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-firm">By firm</TabsTrigger>
          <TabsTrigger value="by-client">By client</TabsTrigger>
          <TabsTrigger value="by-task">By task</TabsTrigger>
        </TabsList>

        <TabsContent value="by-firm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Firms summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Client count, total charged, and total revenue per firm.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Firm</TableHead>
                    <TableHead className="text-right">Clients</TableHead>
                    <TableHead className="text-right">Total charged</TableHead>
                    <TableHead className="text-right">Total revenue</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byFirm.map((firm) => (
                    <FirmRow key={firm.firmId} firm={firm} formatCurrency={formatCurrency} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-client" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clients detail</CardTitle>
              <p className="text-sm text-muted-foreground">
                Per-client assignments, estimated fees, charged amount, and revenue.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Firm</TableHead>
                    <TableHead className="text-right">Assignments</TableHead>
                    <TableHead className="text-right">Est. fees</TableHead>
                    <TableHead className="text-right">Charged</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byClient.map((client) => (
                    <ClientRow key={client.clientId} client={client} formatCurrency={formatCurrency} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-task" className="space-y-4">
          <ByTaskTab byClient={byClient} formatCurrency={formatCurrency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FirmRow({
  firm,
  formatCurrency,
}: Readonly<{
  firm: FirmAnalyticsRow;
  formatCurrency: (n: number) => string;
}>) {
  const [open, setOpen] = useState(false);
  const hasClients = firm.clients.length > 0;

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{firm.firmName}</TableCell>
        <TableCell className="text-right">{firm.clientCount}</TableCell>
        <TableCell className="text-right">{formatCurrency(firm.totalCharged)}</TableCell>
        <TableCell className="text-right">{formatCurrency(firm.totalRevenue)}</TableCell>
        <TableCell>
          {hasClients && (
            <button
              type="button"
              className="p-1 rounded hover:bg-muted"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
            >
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </TableCell>
      </TableRow>
      {hasClients && open &&
        firm.clients.map((c) => (
          <TableRow key={c.clientId} className="bg-muted/40">
            <TableCell className="pl-12 font-medium">{c.clientName}</TableCell>
            <TableCell />
            <TableCell className="text-right">{c.assignmentCount}</TableCell>
            <TableCell className="text-right">{formatCurrency(c.totalEstimatedFees)}</TableCell>
            <TableCell className="text-right">{formatCurrency(c.totalCharged)}</TableCell>
            <TableCell className="text-right">{formatCurrency(c.totalRevenue)}</TableCell>
            <TableCell />
          </TableRow>
        ))}
    </>
  );
}

function ClientRow({
  client,
  formatCurrency,
}: Readonly<{
  client: ClientAnalyticsRow;
  formatCurrency: (n: number) => string;
}>) {
  const [open, setOpen] = useState(false);
  const hasAssignments = client.assignments.length > 0;

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{client.clientName}</TableCell>
        <TableCell>{client.firmName ?? "—"}</TableCell>
        <TableCell className="text-right">{client.assignmentCount}</TableCell>
        <TableCell className="text-right">{formatCurrency(client.totalEstimatedFees)}</TableCell>
        <TableCell className="text-right">{formatCurrency(client.totalCharged)}</TableCell>
        <TableCell className="text-right">{formatCurrency(client.totalRevenue)}</TableCell>
        <TableCell>
          {hasAssignments && (
            <button
              type="button"
              className="p-1 rounded hover:bg-muted"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
            >
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </TableCell>
      </TableRow>
      {hasAssignments && open &&
        client.assignments.map((a) => (
          <TableRow key={a.assignmentId} className="bg-muted/40">
            <TableCell className="pl-12">{a.taskName}</TableCell>
            <TableCell>{a.financialYear ?? "—"}</TableCell>
            <TableCell className="text-right">{a.status ?? "—"}</TableCell>
            <TableCell className="text-right">{formatCurrency(a.estimatedFeesNumeric)}</TableCell>
            <TableCell className="text-right">{formatCurrency(a.charged)}</TableCell>
            <TableCell className="text-right">{formatCurrency(a.revenue)}</TableCell>
            <TableCell />
          </TableRow>
        ))}
    </>
  );
}

function ByTaskTab({
  byClient,
  formatCurrency,
}: Readonly<{
  byClient: ClientAnalyticsRow[];
  formatCurrency: (n: number) => string;
}>) {
  const byTask = new Map<
    string,
    { taskName: string; count: number; totalEstimated: number; totalCharged: number; totalRevenue: number }
  >();

  for (const client of byClient) {
    for (const a of client.assignments) {
      const key = a.taskId;
      const prev = byTask.get(key) ?? {
        taskName: a.taskName,
        count: 0,
        totalEstimated: 0,
        totalCharged: 0,
        totalRevenue: 0,
      };
      byTask.set(key, {
        ...prev,
        count: prev.count + 1,
        totalEstimated: prev.totalEstimated + a.estimatedFeesNumeric,
        totalCharged: prev.totalCharged + a.charged,
        totalRevenue: prev.totalRevenue + a.revenue,
      });
    }
  }

  const rows = Array.from(byTask.entries())
    .map(([taskId, agg]) => ({ taskId, ...agg }))
    .sort((a, b) => a.taskName.localeCompare(b.taskName));

  return (
    <Card>
      <CardHeader>
        <CardTitle>By task</CardTitle>
        <p className="text-sm text-muted-foreground">
          Assignment count and amounts grouped by task type.
        </p>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">No assignment data by task.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead className="text-right">Assignments</TableHead>
                <TableHead className="text-right">Total est. fees</TableHead>
                <TableHead className="text-right">Total charged</TableHead>
                <TableHead className="text-right">Total revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.taskId}>
                  <TableCell className="font-medium">{r.taskName}</TableCell>
                  <TableCell className="text-right">{r.count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(r.totalEstimated)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(r.totalCharged)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(r.totalRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
