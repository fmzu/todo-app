import type { AuthMode } from "@/types/auth";

type Props = {
	authMode: AuthMode;
	authEmail: string;
	authName: string;
	authJoinCode: string;
	authError: string | null;
	onAuthModeChange: (mode: AuthMode) => void;
	onAuthEmailChange: (value: string) => void;
	onAuthNameChange: (value: string) => void;
	onAuthJoinCodeChange: (value: string) => void;
	onSubmit: () => void;
};

export function AuthPanel(props: Props) {
	const authMode = props.authMode;
	const authEmail = props.authEmail;
	const authName = props.authName;
	const authJoinCode = props.authJoinCode;
	const authError = props.authError;
	const onAuthModeChange = props.onAuthModeChange;
	const onAuthEmailChange = props.onAuthEmailChange;
	const onAuthNameChange = props.onAuthNameChange;
	const onAuthJoinCodeChange = props.onAuthJoinCodeChange;
	const onSubmit = props.onSubmit;

	return (
		<div className="flex flex-1 items-center justify-center px-4">
			<div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm">
				<div className="mb-4 flex gap-2">
					<button
						type="button"
						className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
							authMode === "signup"
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						}`}
						onClick={() => onAuthModeChange("signup")}
					>
						新規登録
					</button>
					<button
						type="button"
						className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
							authMode === "login"
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						}`}
						onClick={() => onAuthModeChange("login")}
					>
						ログイン
					</button>
				</div>
				<div className="space-y-3">
					<input
						type="email"
						value={authEmail}
						onChange={(event) => onAuthEmailChange(event.target.value)}
						placeholder="メールアドレス"
						className="w-full rounded-md border px-3 py-2 text-sm"
					/>
					{authMode === "signup" && (
						<>
							<input
								type="text"
								value={authName}
								onChange={(event) => onAuthNameChange(event.target.value)}
								placeholder="表示名"
								className="w-full rounded-md border px-3 py-2 text-sm"
							/>
							<input
								type="text"
								value={authJoinCode}
								onChange={(event) => onAuthJoinCodeChange(event.target.value)}
								placeholder="参加コード（あれば）"
								className="w-full rounded-md border px-3 py-2 text-sm"
							/>
						</>
					)}
				</div>
				{authError && (
					<p className="mt-3 text-sm text-destructive">{authError}</p>
				)}
				<button
					type="button"
					onClick={onSubmit}
					className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
				>
					{authMode === "signup" ? "登録して始める" : "ログイン"}
				</button>
			</div>
		</div>
	);
}
