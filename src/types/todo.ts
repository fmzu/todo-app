export type Member = {
  id: string
  name: string
}

export type Task = {
  id: number
  memberId: string
  title: string
  note?: string
  done: boolean
}
