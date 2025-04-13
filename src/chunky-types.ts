export interface Todo {
  id: number
  text: string
  completed: boolean
}

export type TodoAction =
  | { type: "add"; payload: { text: string } }
  | { type: "delete"; payload: { id: number } }
  | { type: "toggle"; payload: { id: number } }
  | { type: "clearAll" }
  | { type: "archiveDone" }
  | { type: "edit"; payload: { id: number } }
  | { type: "editSubmit"; payload: { id: number; text: string } }

export interface ActiveTodosProps {
  todos: Todo[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onEditSubmit: (id: number, text: string) => void
}

export interface CompletedTodosProps {
  todos: Todo[]
}
