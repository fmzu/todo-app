export type D1PreparedStatement = {
	bind: (...args: unknown[]) => D1PreparedStatement
	all: <T = unknown>() => Promise<{ results: T[] }>
	run: () => Promise<{ meta?: { last_row_id?: number } }>
}

export type D1Database = {
	prepare: (query: string) => D1PreparedStatement
}

export type ExecutionContext = {
	waitUntil: (promise: Promise<unknown>) => void
}

export type Env = {
	DB: D1Database
}

declare module "@tanstack/router-core" {
	interface Register {
		server: {
			requestContext: {
				env: Env
				executionContext: ExecutionContext
			}
		}
	}
}

export {}
