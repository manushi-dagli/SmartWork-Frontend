import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquiriesApi } from "@/api/inquiries.api";
import { createInquiryFormSchema, type CreateInquiryFormValues } from "@/lib/validations";
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
import { ArrowLeft } from "lucide-react";

export default function CreateInquiry() {
  const navigate = useNavigate();

  const form = useForm<CreateInquiryFormValues>({
    resolver: zodResolver(createInquiryFormSchema),
    defaultValues: {
      assignmentTypeId: "",
      contactName: "",
      contactEmail: "",
      contactPhoneCountryCode: "",
      contactPhoneNumber: "",
      contactPhone2CountryCode: "",
      contactPhone2Number: "",
    },
  });

  const { data: inquiryTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ["inquiry-types"],
    queryFn: () => inquiriesApi.listInquiryTypes(),
  });

  const onSubmit = async (values: CreateInquiryFormValues) => {
    try {
      const inquiry = await inquiriesApi.createInquiry({
        assignmentTypeId: values.assignmentTypeId,
        contactName: values.contactName?.trim() || null,
        contactEmail: values.contactEmail?.trim() || null,
        contactPhoneCountryCode: values.contactPhoneCountryCode ?? null,
        contactPhoneNumber: values.contactPhoneNumber ?? null,
        contactPhone2CountryCode: values.contactPhone2CountryCode ?? null,
        contactPhone2Number: values.contactPhone2Number ?? null,
      });
      navigate(`/inquiries/${inquiry.id}`, { replace: true });
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
          <p className="text-muted-foreground text-sm mt-1">Create an inquiry entry for a client visit</p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Inquiry details</CardTitle>
          <CardDescription>Select inquiry type and contact information.</CardDescription>
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
                name="assignmentTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inquiry type *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={typesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inquiryTypes.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
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
