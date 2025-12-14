// Role definitions with clearance levels
export const Roles = {
  CLIENT: "client",
  FREELANCER: "freelancer",
  ADMIN: "admin",
};

// Clearance levels for role-based access control
export const ClearanceLevels = {
  CLIENT: 1,
  FREELANCER: 2,
  ADMIN: 3,
};

Object.freeze(Roles);
Object.freeze(ClearanceLevels);
