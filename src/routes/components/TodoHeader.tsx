import type { Organization } from "@/types/organization";

type Props = {
	todayLabel: string;
	organization: Organization | null;
	isAdmin: boolean;
	orgError: string | null;
	onJoinCodeRefresh: () => void;
	onLogout: () => void;
};

export function TodoHeader(props: Props) {
	const todayLabel = props.todayLabel;
	const organization = props.organization;
	const isAdmin = props.isAdmin;
	const orgError = props.orgError;
	const onJoinCodeRefresh = props.onJoinCodeRefresh;
	const onLogout = props.onLogout;

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-4 pl-8 pr-6">
				<p className="text-lg font-semibold text-muted-foreground">
					{todayLabel}
				</p>
				<div className="flex flex-wrap items-center gap-3">
					{organization && (
						<div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm">
							<span className="text-muted-foreground">参加コード</span>
							<span className="font-semibold tracking-widest">
								{organization.joinCode}
							</span>
						</div>
					)}
					{isAdmin && organization && (
						<button
							type="button"
							className="rounded-md border px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
							onClick={onJoinCodeRefresh}
						>
							参加コード再発行
						</button>
					)}
					<button
						type="button"
						className="text-sm font-semibold text-muted-foreground hover:text-foreground transition"
						onClick={onLogout}
					>
						ログアウト
					</button>
				</div>
			</div>
			{orgError && (
				<p className="mt-2 px-8 text-sm text-destructive">{orgError}</p>
			)}
		</>
	);
}
