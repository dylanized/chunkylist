import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCircle,
  faCircleCheck,
  faStar as faStarRegular,
} from "@fortawesome/free-regular-svg-icons"
import {
  faTrash,
  faPenToSquare,
  faFloppyDisk,
  faGripVertical,
  faStar as faStarSolid,
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
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  editingTodo: number | null
  editText: string
  setEditText: React.Dispatch<React.SetStateAction<string>>
  handleEdit: (id: number) => void
  handleEditSubmit: (id: number) => void
  onStarSelect: (id: number) => void
}

export function ActiveTodos({
  todosArr: todos,
  onToggle,
  onDelete,
  onEditSubmit,
  onReorder,
  onStarSelect,
}: ActiveTodosProps) {
  const [optionalEditingTodoInt, setOptionalEditingTodoInt] = useState<
    number | null
  >(null)
  const [editTextStr, setEditTextStr] = useState<string>("")

  const handleEdit = (idInt: number) => {
    const todoToEdit = todos.find((todo) => todo.id === idInt)
    if (todoToEdit) {
      setOptionalEditingTodoInt(idInt)
      setEditTextStr(todoToEdit.text)
    }
  }

  const handleEditSubmit = (idInt: number) => {
    if (optionalEditingTodoInt !== null && editTextStr.trim() !== "") {
      onEditSubmit(idInt, editTextStr)
      setOptionalEditingTodoInt(null)
      setEditTextStr("")
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
          const newOrderArr = arrayMove(todos, oldIndex, newIndex)
          onReorder(newOrderArr.map((todo) => todo.id))
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
              onToggle={onToggle}
              onDelete={onDelete}
              editingTodo={optionalEditingTodoInt}
              editText={editTextStr}
              setEditText={setEditTextStr}
              handleEdit={handleEdit}
              handleEditSubmit={handleEditSubmit}
              onStarSelect={onStarSelect}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  editingTodo,
  editText,
  setEditText,
  handleEdit,
  handleEditSubmit,
  onStarSelect,
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
    opacity: 1,
    boxShadow: isDragging ? "0 0 10px rgba(192, 192, 192, 0.7)" : "none",
    zIndex: isDragging ? 1000 : 1,
  } as React.CSSProperties

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${todo.completed ? "completed" : ""} ${todo.isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
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
          <div className="edit-star-container">
            <button
              className="star-btn"
              onClick={() => {
                onStarSelect(todo.id)
              }}
              title="Select todo"
            >
              <FontAwesomeIcon
                icon={todo.isSelected ? faStarSolid : faStarRegular}
              />
            </button>
            <button
              className="edit-btn"
              onClick={() => handleEditSubmit(todo.id)}
              title="Save changes"
            >
              <FontAwesomeIcon icon={faFloppyDisk} />
            </button>
          </div>
        ) : (
          <div className="edit-star-container">
            <button
              className="star-btn"
              onClick={() => {
                onStarSelect(todo.id)
              }}
              title="Select todo"
            >
              <FontAwesomeIcon
                icon={todo.isSelected ? faStarSolid : faStarRegular}
              />
            </button>
            <button
              className="edit-btn"
              onClick={() => handleEdit(todo.id)}
              title="Edit todo"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
          </div>
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
