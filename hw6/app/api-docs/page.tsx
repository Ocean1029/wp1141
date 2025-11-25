/**
 * Swagger UI page
 * 
 * This page displays the interactive Swagger UI documentation
 * for the API endpoints.
 */

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpec() {
      try {
        const response = await fetch("/api/docs");
        const data = await response.json();
        setSpec(data);
      } catch (error) {
        console.error("Failed to load Swagger spec:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSpec();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Failed to load API documentation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI
        spec={spec}
        deepLinking={true}
        displayOperationId={false}
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
        docExpansion="list"
        filter={true}
        showExtensions={true}
        showCommonExtensions={true}
      />
    </div>
  );
}

