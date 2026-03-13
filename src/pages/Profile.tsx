import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/api/profile.api";
import type { ProfileEmployee } from "@/types/profile";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { authApi } from "@/api/auth.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, X, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateEmail, validatePhone } from "@/lib/validations";

/** Only fields returned by GET /api/profile. */
interface ProfileState {
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  roleId: string | null;
  roleName: string;
  profilePicture: string;
}

const emptyProfile: ProfileState = {
  firstName: "",
  middleName: "",
  lastName: "",
  username: "",
  email: "",
  phoneNumber: "",
  address: "",
  roleId: null,
  roleName: "",
  profilePicture: "",
};

function isEmployee(emp: { firstName: string; lastName: string; [k: string]: unknown }): emp is ProfileEmployee {
  return "phoneNumber" in emp && "address" in emp;
}

export default function Profile() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileState>(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileState>(emptyProfile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (updatedEmployee) => {
      setEditing(false);
      setAvatarPreview(null);
      // Update local state immediately so the UI reflects changes without waiting for refetch
      if (updatedEmployee) {
        const emp = updatedEmployee as ProfileEmployee;
        setProfile({
          firstName: emp.firstName ?? "",
          middleName: emp.middleName ?? "",
          lastName: emp.lastName ?? "",
          username: emp.username ?? "",
          email: emp.email ?? "",
          phoneNumber: isEmployee(emp) ? emp.phoneNumber ?? "" : "",
          address: isEmployee(emp) ? emp.address ?? "" : "",
          roleId: "roleId" in emp ? emp.roleId ?? null : null,
          roleName: isEmployee(emp) && "roleName" in emp && emp.roleName ? String(emp.roleName) : "",
          profilePicture: isEmployee(emp) && emp.profilePicture ? String(emp.profilePicture) : "",
        });
      }
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      const me = await authApi.getMe();
      if (me) dispatch(setUser({ user: me }));
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message ?? "Failed to update profile." });
    },
  });

  useEffect(() => {
    if (!profileData?.employee) return;
    const emp = profileData.employee;
    setProfile({
      firstName: emp.firstName ?? "",
      middleName: "middleName" in emp && emp.middleName ? String(emp.middleName) : "",
      lastName: emp.lastName ?? "",
      username: "username" in emp && emp.username ? String(emp.username) : "",
      email: emp.email ?? "",
      phoneNumber: isEmployee(emp) ? emp.phoneNumber ?? "" : "",
      address: isEmployee(emp) ? emp.address ?? "" : "",
      roleId: "roleId" in emp ? (emp.roleId as string | null) ?? null : null,
      roleName: isEmployee(emp) && "roleName" in emp && emp.roleName ? String(emp.roleName) : "",
      profilePicture: isEmployee(emp) && emp.profilePicture ? String(emp.profilePicture) : "",
    });
  }, [profileData]);

  const handleEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setAvatarPreview(null);
  };

  const handleSave = () => {
    const email = draft.email.trim();
    const phone = draft.phoneNumber.trim();
    if (email && !validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address.",
      });
      return;
    }
    if (phone && !validatePhone(phone)) {
      toast({
        variant: "destructive",
        title: "Invalid phone",
        description: "Phone must be 3–20 characters (digits, +, spaces allowed).",
      });
      return;
    }
    updateMutation.mutate({
      username: draft.username.trim() || null,
      firstName: draft.firstName.trim() || undefined,
      middleName: draft.middleName.trim() || null,
      lastName: draft.lastName.trim() || undefined,
      email: email || null,
      phoneNumber: phone || null,
      address: draft.address.trim() || null,
      profilePicture: avatarPreview ?? undefined,
    });
  };

  const MAX_AVATAR_SIZE_MB = 2;
  const MAX_AVATAR_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please choose an image (e.g. JPEG, PNG)." });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Profile picture must be under ${MAX_AVATAR_SIZE_MB} MB.`,
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const isSuperAdmin = profileData?.kind === "super_admin";
  const canEdit = !isSuperAdmin;
  const roleName = profile.roleName ?? "";

  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const displayAvatar = avatarPreview || profile.profilePicture;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <div className="text-muted-foreground py-8 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        {canEdit && !editing && (
          <Button onClick={handleEdit} variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-1" /> Edit Profile
          </Button>
        )}
      </div>

      {/* Avatar & Name Banner */}
      <Card>
        <CardContent className="flex items-center gap-6 py-8">
          <div className="relative group">
            <Avatar className="h-24 w-24 text-2xl border-4 border-border shadow-md">
              <AvatarImage src={displayAvatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {editing && !updateMutation.isPending && (
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-background" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {profile.firstName} {profile.lastName}
            </h2>
            {roleName && <p className="text-muted-foreground">{roleName}</p>}
            {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Details – only API fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {editing ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={draft.firstName}
                    onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={draft.lastName}
                    onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={draft.middleName}
                  onChange={(e) => setDraft({ ...draft, middleName: e.target.value })}
                  placeholder="Optional"
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={draft.username}
                  onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                  placeholder="Username"
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  disabled={updateMutation.isPending}
                />
              </div>
              {!isSuperAdmin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={draft.phoneNumber}
                      onChange={(e) => setDraft({ ...draft, phoneNumber: e.target.value })}
                      placeholder="+91 9876543210"
                      disabled={updateMutation.isPending}
                    />
                    {draft.phoneNumber.trim() && !validatePhone(draft.phoneNumber) && (
                      <p className="text-xs text-destructive">
                        Use + country code (1–3 digits) and 10-digit phone number.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={draft.address}
                      onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                      placeholder="Address"
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Name</dt>
                <dd className="mt-1 text-sm text-foreground">{profile.firstName || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Name</dt>
                <dd className="mt-1 text-sm text-foreground">{profile.lastName || "—"}</dd>
              </div>
              {profile.middleName && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Middle Name</dt>
                  <dd className="mt-1 text-sm text-foreground">{profile.middleName}</dd>
                </div>
              )}
              {profile.username && (
                <div>
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</dt>
                  <dd className="mt-1 text-sm text-foreground">{profile.username}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</dt>
                <dd className="mt-1 text-sm text-foreground">{profile.email || "—"}</dd>
              </div>
              {!isSuperAdmin && (
                <>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</dt>
                    <dd className="mt-1 text-sm text-foreground">{profile.phoneNumber || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</dt>
                    <dd className="mt-1 text-sm text-foreground">{profile.address || "—"}</dd>
                  </div>
                </>
              )}
              {roleName && (
                <div>
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</dt>
                  <dd className="mt-1 text-sm text-foreground">{roleName}</dd>
                </div>
              )}
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
