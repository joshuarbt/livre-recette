export type AdminUserListItem = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  isAdmin: boolean;
};

export type AdminActionResult =
  | { success: true }
  | { success: false; error: string };
