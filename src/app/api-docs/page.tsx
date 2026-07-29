import { getApiDocs } from "@/lib/swagger";
import SwaggerUIComponent from "./SwaggerUI";

export default async function ApiDocsPage() {
  const spec = await getApiDocs();
  
  return (
    <div className="container max-w-7xl mx-auto py-10 bg-white dark:bg-zinc-950 rounded-xl my-8 border shadow-sm overflow-hidden">
      <div className="px-4 pb-6">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground mb-8">
          Interactive documentation for the E-Commerce REST API. Use this interface to test endpoints directly.
        </p>
        <SwaggerUIComponent spec={spec} />
      </div>
    </div>
  );
}
