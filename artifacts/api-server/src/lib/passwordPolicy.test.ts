import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's strip-types test runner requires the source extension.
import { passwordPolicyError } from "./passwordPolicy.ts";

test("rejects the exact current password with an Arabic explanation", () => {
  assert.match(passwordPolicyError("old-password", "old-password", "admin@example.invalid")!, /الحالية/);
});

test("rejects the admin email regardless of its letter case", () => {
  assert.match(passwordPolicyError("old-password", "ADMIN@EXAMPLE.INVALID", "admin@example.invalid")!, /الإلكتروني/);
  assert.match(passwordPolicyError("old-password", "admin@example.invalid", "ADMIN@EXAMPLE.INVALID")!, /الإلكتروني/);
});

test("permits different passwords without additional complexity or normalization", () => {
  for (const value of ["abcdefghijkl", "123456789012", "            ", "كلمة مرور جديدة", "old-PASSWORD"]) {
    assert.equal(passwordPolicyError("old-password", value, "admin@example.invalid"), null);
  }
  assert.equal(passwordPolicyError("old-password", " admin@example.invalid ", "admin@example.invalid"), null);
});
