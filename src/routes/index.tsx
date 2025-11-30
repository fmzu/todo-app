import { useState, type KeyboardEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/')({ component: App })

type ChecklistItem = {
  id: number
  text: string
  done: boolean
  note?: string
}

function App() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: 1, text: '今日の最優先タスク', done: false, note: 'ゴールと期限を先に決める' },
    { id: 2, text: 'ミーティングで聞きたいことを1つ', done: false },
    { id: 3, text: 'Enterで次の項目を追加できます', done: false, note: 'Shift+Enterで備考を開いて補足を書く' },
  ])

  const toggleItem = (id: number, next: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: next } : item)))
  }

  const updateText = (id: number, text: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)))
  }

  const updateNote = (id: number, note: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, note } : item)))
  }

  const ensureNote = (id: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, note: item.note ?? '' } : item)))
  }

  const removeNote = (id: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, note: undefined } : item)))
  }

  const insertItem = (index: number) => {
    setItems((prev) => {
      const freshId = Math.max(0, ...prev.map((item) => item.id)) + 1
      const nextItems = [...prev]
      nextItems.splice(index, 0, { id: freshId, text: '', done: false })
      return nextItems
    })
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
    id: number,
    index: number
  ) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      ensureNote(id)
      return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      insertItem(index + 1)
    }
  }

  const removeItem = (id: number) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev))
  }

  const completedCount = items.filter((item) => item.done).length

  return (
    <div className='min-h-screen bg-muted/30 py-10'>
      <div className='mx-auto max-w-4xl space-y-4 px-4'>
        <header className='space-y-2'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
                きょうのフォーカス
              </p>
              <h1 className='text-2xl font-bold leading-tight sm:text-3xl'>
                タスクと備考
              </h1>
            </div>
            <Badge variant='secondary' className='justify-center'>
              {completedCount} / {items.length} 完了
            </Badge>
          </div>
          <p className='text-muted-foreground text-sm'>Enterで次のタスクを追加。Shift+Enterでこの行に備考欄を出すか、「備考を追加」ボタンを押してください。</p>
        </header>

        <div className='space-y-4'>
          {items.map((item, index) => (
            <div
              key={item.id}
              className='flex flex-col gap-2 px-4 py-2'
            >
              <div className='flex gap-4'>
                <div className='pt-2'>
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={(checked) => toggleItem(item.id, Boolean(checked))}
                    aria-label='完了'
                  />
                </div>
                <div className='flex-1'>
                  <Textarea
                    value={item.text}
                    onChange={(event) => updateText(item.id, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(event, item.id, index)}
                    rows={item.text.includes('\n') ? Math.min(5, item.text.split('\n').length + 1) : 2}
                    placeholder='タスクを書いてEnterで次を追加'
                    className='min-h-10 resize-none border-none bg-transparent px-0 py-2 text-base shadow-none focus-visible:border-transparent focus-visible:ring-0'
                  />
                </div>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  aria-label='この行を削除'
                  onClick={() => removeItem(item.id)}
                  className='text-muted-foreground'
                >
                  ×
                </Button>
              </div>

              {item.note !== undefined ? (
                <div className='group/note ml-8 flex items-start gap-2 rounded-md bg-muted/30 px-4 py-2 text-sm'>
                  <Textarea
                    value={item.note}
                    onChange={(event) => updateNote(item.id, event.target.value)}
                    placeholder='補足やリンクなどを書く'
                    rows={item.note.includes('\n') ? Math.min(5, item.note.split('\n').length + 1) : 2}
                    className='min-h-20 flex-1 resize-none border-none bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0'
                  />
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    aria-label='備考を削除'
                    onClick={() => removeNote(item.id)}
                    className='text-muted-foreground opacity-0 transition group-hover/note:opacity-100 group-focus-within/note:opacity-100'
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className='flex items-center gap-2 pl-10'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 px-2 text-xs'
                    onClick={() => ensureNote(item.id)}
                  >
                    備考を追加
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='flex justify-center'>
          <Button
            variant='outline'
            className='w-full sm:w-auto'
            onClick={() => insertItem(items.length)}
          >
            + 行を追加
          </Button>
        </div>
      </div>
    </div>
  )
}
