import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCircle,
  faCircleCheck,
  faStar as faStarRegular,
} from "@fortawesome/free-regular-svg-icons"
import {
  faTrash,
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
  handleEditSubmit: (id: number, text: string) => void
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
  const handleEditSubmit = (id: number, text: string) => {
    if (text.trim() !== "") {
      onEditSubmit(id, text)
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
          const oldIndex = todosArr.findIndex((todo) => todo.id === active.id)
          const newIndex = todosArr.findIndex((todo) => todo.id === over?.id)
          const newOrder = arrayMove(todosArr, oldIndex, newIndex)
          onReorder(newOrder.map((todo) => todo.id))
        }
      }}
    >
      <SortableContext
        items={todosArr.map((todo) => todo.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="todo-list">
          {todosArr.map((todo) => (
            <SortableTodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
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
      className={`${todo.isCompleted ? "completed" : ""} ${todo.isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
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
          todo.isCompleted ? "Mark as incomplete" : "Mark as complete"
        }
      >
        <button className="checkbox-btn">
          <FontAwesomeIcon
            icon={todo.isCompleted ? faCircleCheck : faCircle}
            className={todo.isCompleted ? "completed" : ""}
          />
        </button>
      </div>
      <div className="todo-text">
        <span
          contentEditable
          suppressContentEditableWarning={true}
          spellCheck={false}
          onBlur={(e) => {
            const newText = e.currentTarget.textContent || ""
            if (newText.trim() !== "" && newText !== todo.textStr) {
              handleEditSubmit(todo.id, newText)
            } else {
              // Reset to original text if empty or unchanged
              e.currentTarget.textContent = todo.textStr
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.currentTarget.blur()
            }
          }}
        >
          {todo.textStr}
        </span>
      </div>
      <div className="item-actions">
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
