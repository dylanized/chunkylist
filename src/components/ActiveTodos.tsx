import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircle, faCircleCheck } from "@fortawesome/free-regular-svg-icons"
import {
  faTrash,
  faPenToSquare,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons"
import { ActiveTodosProps } from "../chunky-types"

export function ActiveTodos({
  todos,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
  onEditSubmit,
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
    <ul className="todo-list">
      {todos.map((todo) => (
        <li
          key={todo.id}
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
            aria-label={
              todo.completed ? "Mark as incomplete" : "Mark as complete"
            }
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
                onKeyPress={(e) =>
                  e.key === "Enter" && handleEditSubmit(todo.id)
                }
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
          </div>
        </li>
      ))}
    </ul>
  )
}
