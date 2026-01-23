import type { Member, Task } from "@/types/todo"

export const members: Member[] = [
  { id: "me", name: "自分" },
  { id: "alice", name: "アリス" },
  { id: "bob", name: "ボブ" },
]

export const currentUserId = "me"

export const initialTasks: Task[] = [
  { id: 1, memberId: "me", title: "今日の最優先タスク", note: "ゴールと期限を先に決める", done: false },
  { id: 2, memberId: "me", title: "ミーティングで聞きたいことを1つ", done: false },
  { id: 3, memberId: "me", title: "Enterで次の項目を追加できます", note: "Shift+Enterで備考を開いて補足を書く", done: false },
  { id: 4, memberId: "alice", title: "デザインレビューの準備", note: "最新のモックを共有", done: false },
  { id: 5, memberId: "alice", title: "バグ再現動画を撮る", done: true },
  { id: 6, memberId: "bob", title: "APIレスポンスの確認", done: false },
]
