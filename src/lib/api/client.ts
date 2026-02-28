"use client";

import type { app } from "@/app/api/[[...slugs]]/route";
import { treaty } from "@elysiajs/eden";

export const api = treaty<typeof app>("").api;
