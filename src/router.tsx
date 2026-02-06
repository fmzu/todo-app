import { createRouter } from "@tanstack/react-router"

// 生成されたルートツリーをインポート
import { routeTree } from "./routeTree.gen"

// 新しいルーターインスタンスを作成
export const getRouter = () => {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
	})

	return router
}
