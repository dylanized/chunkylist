import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlus,
  faSquareCheck,
  faEllipsisH,
  faArchive,
  faEye,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { ActiveTodos } from "./components/ActiveTodos"
import { ArchivedTodos } from "./components/ArchivedTodos"
import { Todo } from "./chunky-types"
import "./App.css"

// Define constants for localstorage keys
const ACTIVE_TODOS_KEY: string = "chunkylist-todos"
const ARCHIVED_TODOS_KEY: string = "chunkylist-completed"
const TITLE_KEY: string = "chunkylist-title"

// Define the main App component
function App(): JSX.Element {
  // Remove selectedIds state as we'll use isSelected property on todo items
  const [isArchiveVisible, setIsArchiveVisible] = useState(false)
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [titleStr, setTitleStr] = useState<string>(() => {
    const optionalSavedStr: string | null = localStorage.getItem(TITLE_KEY)
    return optionalSavedStr || "ChunkyList"
  })

  // Create reactive props for active todos, optionally using data from localstorage
  const [activeTodosArr, setActiveTodosArr] = useState<Todo[]>(() => {
    const optionalSavedStr: string | null =
      localStorage.getItem(ACTIVE_TODOS_KEY)
    return optionalSavedStr ? JSON.parse(optionalSavedStr) : []
  })

  // Create reactive props for completed todos, optionally using data from localstorage
  const [archivedTodosArr, setArchivedTodosArr] = useState<Todo[]>(() => {
    const optionalSavedStr: string | null =
      localStorage.getItem(ARCHIVED_TODOS_KEY)
    return optionalSavedStr ? JSON.parse(optionalSavedStr) : []
  })
  const [newTodoStr, setNewTodoStr] = useState("")

  // When any values change, save them all to localstorage
  useEffect(() => {
    localStorage.setItem(TITLE_KEY, titleStr)
    localStorage.setItem(ACTIVE_TODOS_KEY, JSON.stringify(activeTodosArr))
    localStorage.setItem(ARCHIVED_TODOS_KEY, JSON.stringify(archivedTodosArr))
  }, [titleStr, activeTodosArr, archivedTodosArr])

  // Add click handler to close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (): void => {
      if (isMenuVisible) {
        setIsMenuVisible(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isMenuVisible])

  const addTodo = (): void => {
    if (newTodoStr.trim() === "") return

    const newTodosArr: Todo[] = [
      ...activeTodosArr,
      {
        id: Date.now(),
        textStr: newTodoStr,
        isCompleted: false,
        isSelected: false,
      },
    ]
    setActiveTodosArr(newTodosArr)
    setNewTodoStr("")
  }

  const archiveDone = (): void => {
    const completedItemsArr: Todo[] = activeTodosArr.filter(
      (todo) => todo.isCompleted,
    )
    const openItemsArr: Todo[] = activeTodosArr.filter(
      (todo) => !todo.isCompleted,
    )

    setArchivedTodosArr([...archivedTodosArr, ...completedItemsArr])
    setActiveTodosArr(openItemsArr)
  }

  const clearAll = (): void => {
    setActiveTodosArr([])
    setArchivedTodosArr([])
  }

  const deleteTodo = (idInt: number): void => {
    const newTodosArr: Todo[] = activeTodosArr.filter(
      (todo) => todo.id !== idInt,
    )
    setActiveTodosArr(newTodosArr)
  }

  const handleEditSubmit = (idInt: number, textStr: string): void => {
    setActiveTodosArr(
      activeTodosArr.map((todo) =>
        todo.id === idInt ? { ...todo, textStr } : todo,
      ),
    )
  }

  const toggleSelection = (idInt: number): void => {
    const updatedTodosArr: Todo[] = activeTodosArr.map((todo) =>
      todo.id === idInt ? { ...todo, isSelected: !todo.isSelected } : todo,
    )

    setActiveTodosArr(updatedTodosArr)
  }

  const toggleTodo = (idInt: number): void => {
    setActiveTodosArr(
      activeTodosArr.map((todo) =>
        todo.id === idInt ? { ...todo, isCompleted: !todo.isCompleted } : todo,
      ),
    )
  }

  return (
    <div className="container">
      <div className="title-container">
        <h1>
          <span
            contentEditable
            suppressContentEditableWarning={true}
            spellCheck={false}
            onBlur={(e) => {
              const newTitle = e.currentTarget.textContent || ""
              setTitleStr(newTitle.slice(0, 14))
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
          >
            {titleStr}
          </span>

          <FontAwesomeIcon icon={faSquareCheck} className="title-icon" />
        </h1>

        {(activeTodosArr.length > 0 || archivedTodosArr.length > 0) && (
          <div
            className={`kebab-menu-wrapper title-kebab ${isMenuVisible ? "menu-active" : ""}`}
          >
            <FontAwesomeIcon
              icon={faEllipsisH}
              className="kebab-icon"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuVisible(!isMenuVisible)
              }}
            />
            <div className="kebab-popover">
              {activeTodosArr.filter((todo) => todo.isCompleted).length > 0 && (
                <div
                  className="kebab-menu-item archive-done-item"
                  onClick={archiveDone}
                >
                  <FontAwesomeIcon icon={faArchive} /> Archive Done
                </div>
              )}
              {archivedTodosArr.length > 0 && (
                <div
                  className="kebab-menu-item show-archive-item"
                  onClick={() => setIsArchiveVisible(!isArchiveVisible)}
                >
                  <FontAwesomeIcon icon={faEye} />{" "}
                  {isArchiveVisible ? "Hide Archive" : "Show Archive"}
                </div>
              )}
              {(activeTodosArr.length > 0 || archivedTodosArr.length > 0) && (
                <div
                  className="kebab-menu-item clear-all-item"
                  onClick={clearAll}
                >
                  <FontAwesomeIcon icon={faTrash} /> Clear All
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ActiveTodos
        todosArr={activeTodosArr}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEditSubmit={handleEditSubmit}
        onReorder={(idsArr: number[]) => {
          setActiveTodosArr((prev) => {
            return idsArr
              .map((idInt) => prev.find((todo) => todo.id === idInt)!)
              .filter(Boolean)
          })
        }}
        onStarSelect={toggleSelection}
      />

      <div className="add-todo">
        <input
          type="text"
          value={newTodoStr}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewTodoStr(e.target.value)
          }
          placeholder="Add a new task"
          onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
            e.key === "Enter" && addTodo()
          }
        />
        <button onClick={addTodo}>
          <FontAwesomeIcon icon={faPlus} /> Add
        </button>
      </div>

      {isArchiveVisible && archivedTodosArr.length > 0 && (
        <ArchivedTodos todosArr={archivedTodosArr} />
      )}
    </div>
  )
}

export default App
