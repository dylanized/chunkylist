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
  optionalEditingTodoInt: number | null
  editTextStr: string
  setEditTextStr: React.Dispatch<React.SetStateAction<string>>
  handleEdit: (id: number) => void
  handleEditSubmit: (id: number) => void
  onStarSelect: (id: number) => void
}

export function ActiveTodos({
  todosArr,
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
    const todoToEdit = todosArr.find((todo) => todo.idInt === idInt)
    if (todoToEdit) {
      setOptionalEditingTodoInt(idInt)
      setEditTextStr(todoToEdit.textStr)
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
          const oldIndex = todosArr.findIndex(
            (todo) => todo.idInt === active.id,
          )
          const newIndex = todosArr.findIndex((todo) => todo.idInt === over?.id)
          const newOrderArr = arrayMove(todosArr, oldIndex, newIndex)
          onReorder(newOrderArr.map((todo) => todo.idInt))
        }
      }}
    >
      <SortableContext
        items={todosArr.map((todo) => todo.idInt)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="todo-list">
          {todosArr.map((todo) => (
            <SortableTodoItem
              key={todo.idInt}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              optionalEditingTodoInt={optionalEditingTodoInt}
              editTextStr={editTextStr}
              setEditTextStr={setEditTextStr}
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
  optionalEditingTodoInt: optionalEditingTodoInt,
  editTextStr: editTextStr,
  setEditTextStr: setEditTextStr,
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
  } = useSortable({ id: todo.idInt })

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
      className={`${todo.isCompleted ? "completed" : ""} ${todo.isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
      role="listitem"
    >
      <div
        className="todo-left"
        onClick={(e) => {
          e.stopPropagation()
          onToggle(todo.idInt)
        }}
        role="button"
        aria-label={
          todo.isCompleted ? "Mark as incomplete" : "Mark as complete"
        }
      >
        <button className="checkbox-btn">
          <FontAwesomeIcon
            icon={todo.isCompleted ? faCircleCheck : faCircle}
            className={todo.isCompleted ? "completed" : ""}
          />
        </button>
        {optionalEditingTodoInt === todo.idInt ? (
          <input
            type="text"
            value={editTextStr}
            onChange={(e) => setEditTextStr(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && handleEditSubmit(todo.idInt)
            }
            className="edit-input"
            autoFocus
          />
        ) : (
          <span>{todo.textStr}</span>
        )}
      </div>
      <div className="item-actions">
        {optionalEditingTodoInt === todo.idInt ? (
          <div className="edit-star-container">
            <button
              className="star-btn"
              onClick={() => {
                onStarSelect(todo.idInt)
              }}
              title="Select todo"
            >
              <FontAwesomeIcon
                icon={todo.isSelected ? faStarSolid : faStarRegular}
              />
            </button>
            <button
              className="edit-btn"
              onClick={() => handleEditSubmit(todo.idInt)}
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
                onStarSelect(todo.idInt)
              }}
              title="Select todo"
            >
              <FontAwesomeIcon
                icon={todo.isSelected ? faStarSolid : faStarRegular}
              />
            </button>
            <button
              className="edit-btn"
              onClick={() => handleEdit(todo.idInt)}
              title="Edit todo"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
          </div>
        )}
        <button
          className="delete-btn"
          onClick={() => onDelete(todo.idInt)}
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
