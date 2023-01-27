import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "lan-app-2-server";
export const trpc = createTRPCReact<AppRouter>();
