/* Role-based access. Every server action / route handler checks `can()` itself; hiding a button in the
   UI is only a convenience, never the protection. */
export const roles = ["super_admin", "admin", "editor", "author", "viewer"] as const;
export type Role = (typeof roles)[number];
export const perms = ["projects.view", "projects.edit", "projects.publish", "projects.delete", "media.view", "media.upload", "media.delete",
  "inquiries.view", "inquiries.edit", "inquiries.export", "users.manage", "audit.view", "settings.edit", "seo.edit", "redirects.edit"] as const;
export type Perm = (typeof perms)[number];

const rolePerms: Record<Role, readonly Perm[]> = {
  super_admin: perms,
  admin: perms.filter((p) => p !== "users.manage"),
  editor: ["projects.view", "projects.edit", "projects.publish", "media.view", "media.upload", "media.delete", "seo.edit"],
  author: ["projects.view", "media.view", "media.upload"],
  viewer: ["projects.view", "media.view"],
};
export const can = (role: Role, p: Perm) => rolePerms[role]?.includes(p) ?? false;
