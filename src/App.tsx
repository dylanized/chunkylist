import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSquareCheck } from "@fortawesome/free-solid-svg-icons"
import { ActiveTodos } from "./components/ActiveTodos"
import { CompletedTodos } from "./components/CompletedTodos"
import { Todo } from "./chunky-types"
import "./App.css"

// Define constants for localstorage keys
const ACTIVE_TODOS_KEY = "chunkylist-todos"
const COMPLETED_TODOS_KEY = "chunkylist-completed"
const TITLE_KEY = "chunkylist-title"

// Define the main App component
function App(): JSX.Element {
  // Remove selectedIds state as we'll use isSelected property on todo items
  const [showCompleted, setShowCompleted] = useState(false)
  const [title, setTitle] = useState<string>(() => {
    const saved = localStorage.getItem(TITLE_KEY)
    return saved || "ChunkyList"
  })

  // Create reactive props for active todos, optionally using data from localstorage
  const [activeTodos, setActiveTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem(ACTIVE_TODOS_KEY)
    // Add isSelected: false to each todo when loading from localStorage
    return saved
      ? JSON.parse(saved).map(
          (todo: {
            id: number
            text: string
            completed: boolean
            isSelected?: boolean
          }) => ({
            ...todo,
            isSelected: todo.isSelected || false,
          }),
        )
      : []
  })

  // Create reactive props for completed todos, optionally using data from localstorage
  const [completedTodos, setCompletedTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem(COMPLETED_TODOS_KEY)
    // Add isSelected: false to each todo when loading from localStorage
    return saved
      ? JSON.parse(saved).map(
          (todo: {
            id: number
            text: string
            completed: boolean
            isSelected?: boolean
          }) => ({
            ...todo,
            isSelected: todo.isSelected || false,
          }),
        )
      : []
  })
  const [newTodo, setNewTodo] = useState("")

  // When any values change, save them all to localstorage
  useEffect(() => {
    localStorage.setItem(TITLE_KEY, title)
    localStorage.setItem(ACTIVE_TODOS_KEY, JSON.stringify(activeTodos))
    localStorage.setItem(COMPLETED_TODOS_KEY, JSON.stringify(completedTodos))
  }, [title, activeTodos, completedTodos])

  const addTodo = (): void => {
    if (newTodo.trim() === "") return

    const newTodos = [
      ...activeTodos,
      { id: Date.now(), text: newTodo, completed: false, isSelected: false },
    ]
    setActiveTodos(newTodos)
    setNewTodo("")
  }

  const deleteTodo = (id: number): void => {
    const newTodos = activeTodos.filter((todo) => todo.id !== id)
    setActiveTodos(newTodos)
  }

  const toggleTodo = (id: number): void => {
    setActiveTodos(
      activeTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const clearAll = (): void => {
    setActiveTodos([])
    setCompletedTodos([])
  }

  const archiveDone = (): void => {
    const completedItems = activeTodos.filter((todo) => todo.completed)
    const activeItems = activeTodos.filter((todo) => !todo.completed)

    setCompletedTodos([...completedTodos, ...completedItems])
    setActiveTodos(activeItems)
  }

  const handleEditSubmit = (id: number, text: string): void => {
    setActiveTodos(
      activeTodos.map((todo) => (todo.id === id ? { ...todo, text } : todo)),
    )
  }

  // Function to toggle selection state on a todo item
  const toggleSelection = (id: number): void => {
    // Toggle selection for the specific todo
    setActiveTodos(
      activeTodos.map((todo) =>
        todo.id === id ? { ...todo, isSelected: !todo.isSelected } : todo,
      ),
    )
  }

  return (
    <div className="container">
      <h1>
        <input
          type="text"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          className="title-input"
          spellCheck={false}
        />
        <FontAwesomeIcon icon={faSquareCheck} className="title-icon" />
      </h1>

      <ActiveTodos
        todos={activeTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEditSubmit={handleEditSubmit}
        onReorder={(ids: number[]) => {
          setActiveTodos((prev) => {
            return ids
              .map((id) => prev.find((todo) => todo.id === id)!)
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
        {activeTodos.filter((todo) => todo.completed).length > 0 && (
          <span className="action-link" onClick={archiveDone}>
            Archive Done
          </span>
        )}
        {activeTodos.filter((todo) => todo.completed).length > 0 && (
          <span className="separator"> | </span>
        )}
        {completedTodos.length > 0 && (
          <span
            className="action-link"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? "Hide Archive" : "Show Archive"}
          </span>
        )}
        {(activeTodos.length > 0 || completedTodos.length > 0) && (
          <>
            <span className="separator"> | </span>
            <span className="action-link" onClick={clearAll}>
              Clear All
            </span>
          </>
        )}
      </div>

      {showCompleted && completedTodos.length > 0 && (
        <CompletedTodos todos={completedTodos} />
      )}
    </div>
  )
}

export default App
