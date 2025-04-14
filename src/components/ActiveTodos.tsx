import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircle, faCircleCheck } from "@fortawesome/free-regular-svg-icons"
import {
  faTrash,
  faPenToSquare,
  faFloppyDisk,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons"
import { ActiveTodosProps, Todo } from "../chunky-types"
import { DndContext, closestCenter } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableTodoItemProps {
  todo: Todo
  selectedId: number | null
  onSelect: (id: number | null) => void
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  editingTodo: number | null
  editText: string
  setEditText: React.Dispatch<React.SetStateAction<string>>
  handleEdit: (id: number) => void
  handleEditSubmit: (id: number) => void
}

export function ActiveTodos({
  todos,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
  onEditSubmit,
  onReorder,
}: ActiveTodosProps) {
  const [editingTodo, setEditingTodo] = useState<number | null>(null)
  const [editText, setEditText] = useState<string>("")

  const handleEdit = (id: number) => {
    const todoToEdit = todos.find((todo) => todo.id === id)
    if (todoToEdit) {
      setEditingTodo(id)
      setEditText(todoToEdit.text)
    }
  }

  const handleEditSubmit = (id: number) => {
    if (editingTodo !== null && editText.trim() !== "") {
      onEditSubmit(id, editText)
      setEditingTodo(null)
      setEditText("")
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
          const oldIndex = todos.findIndex((todo) => todo.id === active.id)
          const newIndex = todos.findIndex((todo) => todo.id === over?.id)
          const newOrder = arrayMove(todos, oldIndex, newIndex)
          onReorder(newOrder.map((todo) => todo.id))
        }
      }}
    >
      <SortableContext
        items={todos.map((todo) => todo.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="todo-list">
          {todos.map((todo) => (
            <SortableTodoItem
              key={todo.id}
              todo={todo}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
              onDelete={onDelete}
              editingTodo={editingTodo}
              editText={editText}
              setEditText={setEditText}
              handleEdit={handleEdit}
              handleEditSubmit={handleEditSubmit}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableTodoItem({
  todo,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
  editingTodo,
  editText,
  setEditText,
  handleEdit,
  handleEditSubmit,
}: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${todo.completed ? "completed" : ""} ${selectedId === todo.id ? "selected" : ""}`}
      onClick={() => onSelect(selectedId === todo.id ? null : todo.id)}
      role="listitem"
    >
      <div
        className="todo-left"
        onClick={(e) => {
          e.stopPropagation()
          onToggle(todo.id)
        }}
        role="button"
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        <button className="checkbox-btn">
          <FontAwesomeIcon
            icon={todo.completed ? faCircleCheck : faCircle}
            className={todo.completed ? "completed" : ""}
          />
        </button>
        {editingTodo === todo.id ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleEditSubmit(todo.id)}
            className="edit-input"
            autoFocus
          />
        ) : (
          <span>{todo.text}</span>
        )}
      </div>
      <div className="item-actions">
        {editingTodo === todo.id ? (
          <button
            className="edit-btn"
            onClick={() => handleEditSubmit(todo.id)}
            title="Save changes"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
        ) : (
          <button
            className="edit-btn"
            onClick={() => handleEdit(todo.id)}
            title="Edit todo"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        )}
        <button
          className="delete-btn"
          onClick={() => onDelete(todo.id)}
          title="Delete todo"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <span
          className="drag-handle"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <FontAwesomeIcon icon={faGripVertical} />
        </span>
      </div>
    </li>
  )
}
