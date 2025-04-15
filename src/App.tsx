import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSquareCheck } from "@fortawesome/free-solid-svg-icons"
import { ActiveTodos } from "./components/ActiveTodos"
import { CompletedTodos } from "./components/CompletedTodos"
import { Todo } from "./chunky-types"
import "./App.css"

// Define constants for localstorage keys
const ACTIVE_TODOS_KEY = "chunkylist-todos"
const ARCHIVED_TODOS_KEY = "chunkylist-completed"
const TITLE_KEY = "chunkylist-title"

// Define the main App component
function App(): JSX.Element {
  // Remove selectedIds state as we'll use isSelected property on todo items
  const [showCompletedArr, setShowCompletedArr] = useState(false)
  const [titleStr, setTitleStr] = useState<string>(() => {
    const savedStr = localStorage.getItem(TITLE_KEY)
    return savedStr || "ChunkyList"
  })

  // Create reactive props for active todos, optionally using data from localstorage
  const [activeTodosArr, setActiveTodosArr] = useState<Todo[]>(() => {
    const savedStr = localStorage.getItem(ACTIVE_TODOS_KEY)
    // Add isSelected: false to each todo when loading from localStorage
    return savedStr ? JSON.parse(savedStr) : []
  })

  // Create reactive props for completed todos, optionally using data from localstorage
  const [archivedTodosArr, setArchivedTodosArr] = useState<Todo[]>(() => {
    const savedStr = localStorage.getItem(ARCHIVED_TODOS_KEY)
    // Add isSelected: false to each todo when loading from localStorage
    return savedStr ? JSON.parse(savedStr) : []
  })
  const [newTodo, setNewTodo] = useState("")

  // When any values change, save them all to localstorage
  useEffect(() => {
    localStorage.setItem(TITLE_KEY, titleStr)
    localStorage.setItem(ACTIVE_TODOS_KEY, JSON.stringify(activeTodosArr))
    localStorage.setItem(ARCHIVED_TODOS_KEY, JSON.stringify(archivedTodosArr))
  }, [titleStr, activeTodosArr, archivedTodosArr])

  const addTodo = (): void => {
    if (newTodo.trim() === "") return

    const newTodosArr = [
      ...activeTodosArr,
      {
        id: Date.now(),
        textStr: newTodo,
        isCompleted: false,
        isSelected: false,
      },
    ]
    setActiveTodosArr(newTodosArr)
    setNewTodo("")
  }

  const deleteTodo = (idInt: number): void => {
    const newTodosArr = activeTodosArr.filter((todo) => todo.id !== idInt)
    setActiveTodosArr(newTodosArr)
  }

  const toggleTodo = (idInt: number): void => {
    setActiveTodosArr(
      activeTodosArr.map((todo) =>
        todo.id === idInt ? { ...todo, isCompleted: !todo.isCompleted } : todo,
      ),
    )
  }

  const clearAll = (): void => {
    setActiveTodosArr([])
    setArchivedTodosArr([])
  }

  const archiveDone = (): void => {
    const completedItemsArr = activeTodosArr.filter((todo) => todo.isCompleted)
    const activeItemsArr = activeTodosArr.filter((todo) => !todo.isCompleted)

    setArchivedTodosArr([...archivedTodosArr, ...completedItemsArr])
    setActiveTodosArr(activeItemsArr)
  }

  const handleEditSubmit = (idInt: number, textStr: string): void => {
    setActiveTodosArr(
      activeTodosArr.map((todo) =>
        todo.id === idInt ? { ...todo, textStr: textStr } : todo,
      ),
    )
  }

  // Function to toggle selection state on a todo item
  const toggleSelection = (idInt: number): void => {
    // Toggle selection for the specific todo
    setActiveTodosArr(
      activeTodosArr.map((todo) =>
        todo.id === idInt ? { ...todo, isSelected: !todo.isSelected } : todo,
      ),
    )
  }

  return (
    <div className="container">
      <h1>
        <input
          type="text"
          value={titleStr}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitleStr(e.target.value)
          }
          className="title-input"
          spellCheck={false}
        />
        <FontAwesomeIcon icon={faSquareCheck} className="title-icon" />
      </h1>

      <ActiveTodos
        todos={activeTodosArr}
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
          value={newTodo}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewTodo(e.target.value)
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

      <div className="actions">
        {activeTodosArr.filter((todo) => todo.isCompleted).length > 0 && (
          <span className="action-link" onClick={archiveDone}>
            Archive Done
          </span>
        )}
        {activeTodosArr.filter((todo) => todo.isCompleted).length > 0 && (
          <span className="separator"> | </span>
        )}
        {archivedTodosArr.length > 0 && (
          <span
            className="action-link"
            onClick={() => setShowCompletedArr(!showCompletedArr)}
          >
            {showCompletedArr ? "Hide Archive" : "Show Archive"}
          </span>
        )}
        {(activeTodosArr.length > 0 || archivedTodosArr.length > 0) && (
          <>
            <span className="separator"> | </span>
            <span className="action-link" onClick={clearAll}>
              Clear All
            </span>
          </>
        )}
      </div>

      {showCompletedArr && archivedTodosArr.length > 0 && (
        <CompletedTodos todos={archivedTodosArr} />
      )}
    </div>
  )
}

export default App
