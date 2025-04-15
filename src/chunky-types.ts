export interface Todo {
  idInt: number
  textStr: string
  isCompleted: boolean
  isSelected: boolean
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
