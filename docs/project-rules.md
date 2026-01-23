# Project Rules

## 目的
- プロジェクト固有の設計/機能メモをまとめる

## 機能概要
- メンバーごとのタスク列を表示する
- 自分の列のみ編集できる
- Enterで行追加、Shift+Enterで備考を追加する

## データ/サーバー
- TanStack Startのserver functionsでAPIを実装する
- D1に永続化する

## 構成メモ
- 画面固有のコンポーネントは`src/routes/components`に置く
- DB操作は`src/lib/todo-db.ts`に集約する
- 今後、アカウントは`src/lib/user-db.ts`、認証は`src/lib/auth-db.ts`で分離する
