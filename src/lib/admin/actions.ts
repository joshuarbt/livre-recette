"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { translateAuthError } from "@/lib/auth/errors";
import type { AdminActionResult } from "@/types/admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function revalidateAdmin(): void {
  revalidatePath("/admin");
}

export async function updateUserEmail(
  userId: string,
  email: string,
): Promise<AdminActionResult> {
  await requireAdmin();

  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { success: false, error: "Format d'adresse e-mail invalide." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    email: trimmed,
    email_confirm: true,
  });

  if (error) {
    return { success: false, error: translateAuthError(error.message) };
  }

  revalidateAdmin();
  return { success: true };
}

export async function updateUserPassword(
  userId: string,
  password: string,
): Promise<AdminActionResult> {
  await requireAdmin();

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });

  if (error) {
    return { success: false, error: translateAuthError(error.message) };
  }

  revalidateAdmin();
  return { success: true };
}

export async function deleteUserAccount(userId: string): Promise<AdminActionResult> {
  const currentAdmin = await requireAdmin();

  if (currentAdmin.id === userId) {
    return { success: false, error: "Vous ne pouvez pas supprimer votre propre compte." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    return { success: false, error: translateAuthError(error.message) };
  }

  revalidateAdmin();
  return { success: true };
}
