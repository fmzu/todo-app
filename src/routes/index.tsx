import { createFileRoute } from "@tanstack/react-router";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";
import { formatJapanDate } from "@/lib/date";
import {
	canEditMember,
	ensureTaskNote,
	removeTaskNote,
	toggleTaskDone,
	updateTaskNote,
	updateTaskTitle,
} from "@/lib/tasks";
import { AuthPanel } from "@/routes/components/AuthPanel";
import { MemberColumn } from "@/routes/components/MemberColumn";
import { TodoHeader } from "@/routes/components/TodoHeader";
import type { Account } from "@/types/account";
import type { AuthMode } from "@/types/auth";
import type { Organization } from "@/types/organization";
import type { Member, Task } from "@/types/todo";
import { createAccount } from "@/utils/create-account.functions";
import { createTask } from "@/utils/create-task.functions";
import { deleteTask } from "@/utils/delete-task.functions";
import { fetchAccountByEmail } from "@/utils/fetch-account-by-email.functions";
import { fetchOrganization } from "@/utils/fetch-organization.functions";
import { fetchTodoState } from "@/utils/fetch-todo-state.functions";
import { updateOrganizationJoinCode } from "@/utils/update-organization-join-code.functions";
import { updateTask } from "@/utils/update-task.functions";

const TITLE_LIMIT = 80;
const NOTE_LIMIT = 500;

type TaskErrors = {
	title?: string;
	note?: string;
};

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const [account, setAccount] = useState<Account | null>(null);
	const [isBootstrapped, setIsBootstrapped] = useState(false);
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [members, setMembers] = useState<Member[]>([]);
	const [taskErrors, setTaskErrors] = useState<Record<number, TaskErrors>>({});
	const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
	const [authMode, setAuthMode] = useState<AuthMode>("signup");
	const [authError, setAuthError] = useState<string | null>(null);
	const [orgError, setOrgError] = useState<string | null>(null);
	const [authEmail, setAuthEmail] = useState("");
	const [authName, setAuthName] = useState("");
	const [authJoinCode, setAuthJoinCode] = useState("");
	const todayLabel = formatJapanDate(new Date());
	const organizationId = account?.organizationId ?? null;
	const isAdmin = account?.isAdmin ?? false;

	const currentUserId = account?.id ?? "";
	const isEditable = (memberId: string) =>
		canEditMember(memberId, currentUserId);

	/**
	 * チェック状態の切り替え
	 * @param id タスクID
	 * @param next 次の完了状態
	 */
	const toggleTask = (id: number, next: boolean) => {
		if (!organizationId) return;
		setTasks((prev) => toggleTaskDone(prev, id, next, currentUserId));
		void updateTask({ data: { id, done: next, organizationId } }).then(
			(updatedTasks) => setTasks(updatedTasks),
		);
	};

	const getTitleError = (title: string) => {
		const trimmed = title.trim();
		return trimmed.length > TITLE_LIMIT
			? `タイトルは${TITLE_LIMIT}文字以内で入力してください`
			: undefined;
	};
	const getNoteError = (note: string) =>
		note.length > NOTE_LIMIT
			? `内容は${NOTE_LIMIT}文字以内で入力してください`
			: undefined;

	const updateTaskErrors = (
		taskId: number,
		title: string,
		note: string | null | undefined,
	) => {
		const nextErrors = {
			title: getTitleError(title),
			note: getNoteError(note ?? ""),
		};
		setTaskErrors((prev) => ({ ...prev, [taskId]: nextErrors }));
		return nextErrors;
	};

	const commitTask = (task: Task, noteOverride?: string | null) => {
		if (!organizationId) return Promise.resolve(null);
		const note = noteOverride ?? task.note ?? null;
		const nextErrors = updateTaskErrors(task.id, task.title, note);
		if (nextErrors.title || nextErrors.note) {
			return Promise.resolve(null);
		}
		return updateTask({
			data: { id: task.id, title: task.title, note, organizationId },
		}).then((updatedTasks) => {
			setTasks(updatedTasks);
			setTaskErrors((prev) => ({ ...prev, [task.id]: {} }));
			return updatedTasks;
		});
	};

	/**
	 * タスク本文の更新
	 * @param id タスクID
	 * @param title 本文
	 */
	const updateTitle = (id: number, title: string) => {
		setTasks((prev) => updateTaskTitle(prev, id, title, currentUserId));
		const existingNote = tasks.find((task) => task.id === id)?.note ?? null;
		updateTaskErrors(id, title, existingNote);
	};

	/**
	 * 備考の更新
	 * @param id タスクID
	 * @param note 備考
	 */
	const updateNote = (id: number, note: string) => {
		setTasks((prev) => updateTaskNote(prev, id, note, currentUserId));
		const existingTitle = tasks.find((task) => task.id === id)?.title ?? "";
		updateTaskErrors(id, existingTitle, note);
	};

	/**
	 * 備考欄を新規で確保
	 * @param id タスクID
	 */
	const ensureNote = (id: number) => {
		setTasks((prev) => ensureTaskNote(prev, id, currentUserId));
		const existingTitle = tasks.find((task) => task.id === id)?.title ?? "";
		updateTaskErrors(id, existingTitle, "");
	};

	/**
	 * 備考欄の削除
	 * @param id タスクID
	 */
	const removeNote = (id: number) => {
		setTasks((prev) => removeTaskNote(prev, id, currentUserId));
		const existingTitle = tasks.find((task) => task.id === id)?.title ?? "";
		updateTaskErrors(id, existingTitle, null);
	};

	/**
	 * 新しい行を挿入（自分の列のみ）
	 * @param memberId メンバーID
	 */
	const insertTask = (memberId: string) => {
		if (!isEditable(memberId)) return;
		const emptyTask = tasks.find(
			(task) => task.memberId === memberId && task.title.trim().length === 0,
		);
		if (emptyTask) {
			setFocusTaskId(emptyTask.id);
			return;
		}
		if (!organizationId) return;
		void createTask({ data: { memberId, organizationId, title: "" } }).then(
			(updatedTasks) => {
				setTasks(updatedTasks);
				const memberTasks = updatedTasks.filter(
					(task) => task.memberId === memberId,
				);
				const latestTask = memberTasks.reduce<Task | null>(
					(current, task) => (current && current.id > task.id ? current : task),
					null,
				);
				setFocusTaskId(latestTask?.id ?? null);
			},
		);
	};

	const handleFocusHandled = (taskId: number) => {
		if (focusTaskId === taskId) {
			setFocusTaskId(null);
		}
	};

	/**
	 * Enterで保存、Shift+Enterで備考欄を追加（自分の列のみ）
	 * @param event キーイベント
	 * @param task 対象タスク
	 */
	const handleKeyDown = (
		event: KeyboardEvent<HTMLTextAreaElement>,
		task: Task,
	) => {
		if (!isEditable(task.memberId)) return;

		if (event.key === "Enter" && event.shiftKey) {
			event.preventDefault();
			ensureNote(task.id);
			void commitTask(task, task.note ?? "");
			return;
		}

		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void commitTask(task);
		}
	};

	/**
	 * タスク削除（自分の列のみ）
	 * @param id タスクID
	 */
	const removeTask = (id: number) => {
		if (tasks.length <= 1) return;
		if (!organizationId) return;
		void deleteTask({ data: { id, organizationId } }).then((updatedTasks) =>
			setTasks(updatedTasks),
		);
	};

	const syncTodoState = useCallback((nextOrganizationId: string) => {
		void fetchTodoState({ data: { organizationId: nextOrganizationId } }).then(
			(payload) => {
				setMembers(payload.members);
				setTasks(payload.tasks);
			},
		);
	}, []);

	const syncOrganization = useCallback((nextOrganizationId: string) => {
		void fetchOrganization({ data: { organizationId: nextOrganizationId } })
			.then((payload) => setOrganization(payload))
			.catch(() => setOrganization(null));
	}, []);

	const handleJoinCodeRefresh = async () => {
		setOrgError(null);
		if (!organizationId || !account) return;
		try {
			const updated = await updateOrganizationJoinCode({
				data: { organizationId, accountId: account.id },
			});
			setOrganization(updated);
		} catch (error) {
			setOrgError(getAuthErrorMessage(error, "参加コードの更新に失敗しました"));
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("todo.account");
		setAccount(null);
		setOrganization(null);
		setMembers([]);
		setTasks([]);
		setAuthError(null);
		setOrgError(null);
	};

	const handleAuthModeChange = (mode: AuthMode) => {
		setAuthMode(mode);
		setAuthError(null);
	};

	const handleAuthEmailChange = (value: string) => {
		setAuthEmail(value);
	};

	const handleAuthNameChange = (value: string) => {
		setAuthName(value);
	};

	const handleAuthJoinCodeChange = (value: string) => {
		setAuthJoinCode(value);
	};

	const getAuthErrorMessage = (error: unknown, fallback: string) => {
		const isJapaneseMessage = (message: string) =>
			/[ぁ-んァ-ン一-龯]/.test(message);
		if (error instanceof Error) {
			try {
				const parsed = JSON.parse(error.message) as Array<{ message?: string }>;
				const message = parsed?.[0]?.message;
				if (
					typeof message === "string" &&
					message.length > 0 &&
					isJapaneseMessage(message)
				) {
					return message;
				}
			} catch {
				// JSON parse failed
			}
			if (error.message && isJapaneseMessage(error.message)) {
				return error.message;
			}
		}
		return fallback;
	};

	const handleAuth = async () => {
		setAuthError(null);
		setOrgError(null);
		if (!authEmail) {
			setAuthError("メールアドレスを入力してください");
			return;
		}

		if (authMode === "login") {
			try {
				const result = await fetchAccountByEmail({
					data: { email: authEmail },
				});
				if (!result) {
					setAuthError("アカウントが見つかりませんでした");
					return;
				}
				localStorage.setItem("todo.account", JSON.stringify(result));
				setAccount(result);
				syncTodoState(result.organizationId);
				syncOrganization(result.organizationId);
				return;
			} catch (error) {
				setAuthError(getAuthErrorMessage(error, "ログインに失敗しました"));
				return;
			}
		}

		if (!authName) {
			setAuthError("名前を入力してください");
			return;
		}

		try {
			const result = await createAccount({
				data: {
					email: authEmail,
					name: authName,
					joinCode: authJoinCode || null,
				},
			});
			localStorage.setItem("todo.account", JSON.stringify(result));
			setAccount(result);
			syncTodoState(result.organizationId);
			syncOrganization(result.organizationId);
			setAuthJoinCode("");
		} catch (error) {
			setAuthError(getAuthErrorMessage(error, "登録に失敗しました"));
		}
	};

	useEffect(() => {
		const stored = localStorage.getItem("todo.account");
		if (!stored) {
			setIsBootstrapped(true);
			return;
		}
		try {
			const parsed = JSON.parse(stored) as Account;
			const normalized = { ...parsed, isAdmin: parsed.isAdmin ?? false };
			setAccount(normalized);
			syncTodoState(normalized.organizationId);
			syncOrganization(normalized.organizationId);
			if (parsed.isAdmin === undefined) {
				void fetchAccountByEmail({ data: { email: normalized.email } }).then(
					(result) => {
						if (!result) return;
						localStorage.setItem("todo.account", JSON.stringify(result));
						setAccount(result);
						syncTodoState(result.organizationId);
						syncOrganization(result.organizationId);
					},
				);
			}
			setIsBootstrapped(true);
		} catch {
			localStorage.removeItem("todo.account");
			setIsBootstrapped(true);
		}
	}, [syncOrganization, syncTodoState]);

	if (!isBootstrapped) {
		return <div className="flex h-screen flex-col bg-muted/30" />;
	}

	return (
		<div className="flex h-screen flex-col bg-muted/30 py-10">
			{!account ? (
				<AuthPanel
					authMode={authMode}
					authEmail={authEmail}
					authName={authName}
					authJoinCode={authJoinCode}
					authError={authError}
					onAuthModeChange={handleAuthModeChange}
					onAuthEmailChange={handleAuthEmailChange}
					onAuthNameChange={handleAuthNameChange}
					onAuthJoinCodeChange={handleAuthJoinCodeChange}
					onSubmit={() => void handleAuth()}
				/>
			) : (
				<>
					<TodoHeader
						todayLabel={todayLabel}
						organization={organization}
						isAdmin={isAdmin}
						orgError={orgError}
						onJoinCodeRefresh={() => void handleJoinCodeRefresh()}
						onLogout={handleLogout}
					/>
					<div className="flex-1 flex overflow-x-auto px-4 pb-4 pt-2">
						<div className="flex w-max gap-4">
							{members.map((member) => {
								const memberTasks = tasks.filter(
									(task) => task.memberId === member.id,
								);
								const doneCount = memberTasks.filter(
									(task) => task.done,
								).length;
								const editable = isEditable(member.id);

								return (
									<MemberColumn
										key={member.id}
										member={member}
										tasks={memberTasks}
										doneCount={doneCount}
										editable={editable}
										taskErrors={taskErrors}
										focusTaskId={focusTaskId}
										onFocusHandled={handleFocusHandled}
										onInsertTask={insertTask}
										onToggle={toggleTask}
										onUpdateTitle={updateTitle}
										onUpdateNote={updateNote}
										onEnsureNote={ensureNote}
										onRemoveNote={removeNote}
										onRemoveTask={removeTask}
										onKeyDown={handleKeyDown}
									/>
								);
							})}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
