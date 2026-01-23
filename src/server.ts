import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server"
import type { Env, ExecutionContext } from "@/types/server"

const handler = createStartHandler(defaultStreamHandler)

export default {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
    return await handler(request, { context: { env, executionContext } })
  },
}
