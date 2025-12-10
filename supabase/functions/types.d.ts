declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

declare module "std/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { port?: number }
  ): void;
}
