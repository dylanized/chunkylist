// Interfaces

export interface ActiveTodosProps {
  todosArr: Todo[]
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onEditSubmit: (id: number, text: string) => void
  onReorder: (ids: number[]) => void
  onStarSelect: (id: number) => void
}

export interface ArchivedTodosProps {
  todosArr: Todo[]
}

export interface Todo {
  id: number
  textStr: string
  isCompleted: boolean
  isSelected: boolean
}

// Records

export type FlexibleObject = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

// Types

export type TodoAction =
  | { type: "add"; payload: { text: string } }
  | { type: "delete"; payload: { id: number } }
  | { type: "toggle"; payload: { id: number } }
  | { type: "clearAll" }
  | { type: "archiveDone" }
  | { type: "edit"; payload: { id: number } }
  | { type: "editSubmit"; payload: { id: number; text: string } }
