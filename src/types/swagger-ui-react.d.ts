declare module "swagger-ui-react" {
  import { ComponentType } from "react";

  export interface SwaggerUIProps {
    spec?: object | string;
    url?: string;
    layout?: string;
    onComplete?: (system: any) => void;
    requestInterceptor?: (req: any) => any;
    responseInterceptor?: (res: any) => any;
    docExpansion?: "list" | "full" | "none";
    defaultModelExpandDepth?: number;
    displayOperationId?: boolean;
    plugins?: any[];
    supportedSubmitMethods?: string[];
    showMutatedRequest?: boolean;
    deepLinking?: boolean;
    presets?: any[];
    filter?: string | boolean;
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
