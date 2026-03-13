export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskCategory = "audit" | "tax-filing" | "gst" | "compliance" | "advisory" | "bookkeeping";

export interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assigneeId: string;
  clientName: string;
  dueDate: string;
  subtasks: SubTask[];
  milestoneId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  tasksAssigned: number;
  tasksCompleted: number;
  status: "active" | "on-leave" | "busy";
}

export interface Milestone {
  id: string;
  title: string;
  deadline: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export const teamMembers: TeamMember[] = [
  { id: "1", name: "Rajesh Kumar", role: "Senior CA", email: "rajesh@firm.com", avatar: "RK", tasksAssigned: 12, tasksCompleted: 8, status: "active" },
  { id: "2", name: "Priya Sharma", role: "CA Associate", email: "priya@firm.com", avatar: "PS", tasksAssigned: 9, tasksCompleted: 6, status: "active" },
  { id: "3", name: "Amit Patel", role: "Article Clerk", email: "amit@firm.com", avatar: "AP", tasksAssigned: 15, tasksCompleted: 11, status: "busy" },
  { id: "4", name: "Sneha Gupta", role: "Tax Consultant", email: "sneha@firm.com", avatar: "SG", tasksAssigned: 7, tasksCompleted: 5, status: "active" },
  { id: "5", name: "Vikram Singh", role: "Audit Manager", email: "vikram@firm.com", avatar: "VS", tasksAssigned: 10, tasksCompleted: 9, status: "on-leave" },
  { id: "6", name: "Neha Joshi", role: "GST Specialist", email: "neha@firm.com", avatar: "NJ", tasksAssigned: 8, tasksCompleted: 4, status: "active" },
];

export const milestones: Milestone[] = [
  { id: "m1", title: "Q3 Tax Filing Deadline", deadline: "2026-03-31", progress: 65, totalTasks: 20, completedTasks: 13 },
  { id: "m2", title: "Annual Audit - ABC Corp", deadline: "2026-04-15", progress: 40, totalTasks: 15, completedTasks: 6 },
  { id: "m3", title: "GST Annual Return", deadline: "2026-03-15", progress: 80, totalTasks: 10, completedTasks: 8 },
  { id: "m4", title: "Compliance Review Q1", deadline: "2026-04-01", progress: 25, totalTasks: 12, completedTasks: 3 },
];

export const tasks: Task[] = [
  {
    id: "t1", title: "Prepare ITR for XYZ Pvt Ltd", description: "Complete income tax return preparation", status: "in-progress", priority: "high", category: "tax-filing",
    assigneeId: "1", clientName: "XYZ Pvt Ltd", dueDate: "2026-03-15",
    subtasks: [
      { id: "s1", title: "Collect financial statements", status: "completed", assigneeId: "3" },
      { id: "s2", title: "Verify TDS credits", status: "in-progress", assigneeId: "1" },
      { id: "s3", title: "Compute tax liability", status: "pending", assigneeId: "1" },
    ],
    milestoneId: "m1",
  },
  {
    id: "t2", title: "GST Reconciliation - ABC Corp", description: "Monthly GST reconciliation and filing", status: "pending", priority: "urgent", category: "gst",
    assigneeId: "6", clientName: "ABC Corp", dueDate: "2026-03-10",
    subtasks: [
      { id: "s4", title: "Download GSTR-2A", status: "completed", assigneeId: "6" },
      { id: "s5", title: "Match with purchase register", status: "pending", assigneeId: "6" },
    ],
    milestoneId: "m3",
  },
  {
    id: "t3", title: "Statutory Audit - DEF Industries", description: "Conduct statutory audit for FY 2025-26", status: "in-progress", priority: "high", category: "audit",
    assigneeId: "5", clientName: "DEF Industries", dueDate: "2026-04-15",
    subtasks: [
      { id: "s6", title: "Audit planning memo", status: "completed", assigneeId: "5" },
      { id: "s7", title: "Vouching and verification", status: "in-progress", assigneeId: "3" },
      { id: "s8", title: "Management representation letter", status: "pending", assigneeId: "5" },
      { id: "s9", title: "Draft audit report", status: "pending", assigneeId: "5" },
    ],
    milestoneId: "m2",
  },
  {
    id: "t4", title: "TDS Return Filing - Q3", description: "Prepare and file TDS returns for Q3", status: "completed", priority: "medium", category: "compliance",
    assigneeId: "4", clientName: "Multiple Clients", dueDate: "2026-02-15",
    subtasks: [
      { id: "s10", title: "Compile TDS data", status: "completed", assigneeId: "4" },
      { id: "s11", title: "Generate Form 26Q", status: "completed", assigneeId: "4" },
    ],
  },
  {
    id: "t5", title: "Business Advisory - GHI Startups", description: "Provide financial advisory services", status: "pending", priority: "low", category: "advisory",
    assigneeId: "2", clientName: "GHI Startups", dueDate: "2026-03-20",
    subtasks: [
      { id: "s12", title: "Financial health assessment", status: "pending", assigneeId: "2" },
      { id: "s13", title: "Prepare advisory report", status: "pending", assigneeId: "2" },
    ],
  },
  {
    id: "t6", title: "Monthly Bookkeeping - JKL Traders", description: "Record and reconcile monthly transactions", status: "overdue", priority: "medium", category: "bookkeeping",
    assigneeId: "3", clientName: "JKL Traders", dueDate: "2026-02-20",
    subtasks: [
      { id: "s14", title: "Bank reconciliation", status: "in-progress", assigneeId: "3" },
      { id: "s15", title: "Journal entries", status: "pending", assigneeId: "3" },
    ],
  },
  {
    id: "t7", title: "ROC Annual Filing - MNO Corp", description: "File annual returns with ROC", status: "in-progress", priority: "high", category: "compliance",
    assigneeId: "2", clientName: "MNO Corp", dueDate: "2026-03-30",
    subtasks: [
      { id: "s16", title: "Prepare AOC-4", status: "completed", assigneeId: "2" },
      { id: "s17", title: "Prepare MGT-7", status: "in-progress", assigneeId: "2" },
    ],
    milestoneId: "m4",
  },
  {
    id: "t8", title: "Tax Planning - PQR Holdings", description: "Year-end tax planning and advisory", status: "pending", priority: "high", category: "tax-filing",
    assigneeId: "4", clientName: "PQR Holdings", dueDate: "2026-03-25",
    subtasks: [
      { id: "s18", title: "Review current tax position", status: "pending", assigneeId: "4" },
      { id: "s19", title: "Identify deduction opportunities", status: "pending", assigneeId: "4" },
    ],
    milestoneId: "m1",
  },
];

export const categoryLabels: Record<TaskCategory, string> = {
  audit: "Audit",
  "tax-filing": "Tax Filing",
  gst: "GST",
  compliance: "Compliance",
  advisory: "Advisory",
  bookkeeping: "Bookkeeping",
};

export const statusColors: Record<TaskStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  "in-progress": "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
};

export const priorityColors: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};
