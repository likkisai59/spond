import { ROUTES } from "@/constants/routes";
import { Role } from "@/types/user";

export function getRoleDashboard(role: Role): string {
  switch (role) {
    case "admin":
    case "super-admin":
      return ROUTES.ADMIN;
    case "artist":
    case "band":
    case "client":
      return "/band/dashboard";
    default:
      return ROUTES.SELECT_PRODUCT;
  }
}
