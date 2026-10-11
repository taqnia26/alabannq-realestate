/** Passwords stay literal (no trimming or hidden complexity requirements). */
export function passwordPolicyError(currentPassword: string, newPassword: string, email: string): string | null {
  if (newPassword === currentPassword) {
    return "كلمة المرور الجديدة يجب أن تختلف عن كلمة المرور الحالية.";
  }
  if (newPassword.toLowerCase() === email.toLowerCase()) {
    return "كلمة المرور الجديدة لا يمكن أن تطابق بريدك الإلكتروني.";
  }
  return null;
}
