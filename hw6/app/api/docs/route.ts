/**
 * Swagger JSON endpoint
 * 
 * This route provides the Swagger/OpenAPI JSON specification
 * for API documentation. The specification is generated from
 * JSDoc comments in API route files.
 */

import { swaggerSpec } from "@/lib/swagger";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(swaggerSpec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

