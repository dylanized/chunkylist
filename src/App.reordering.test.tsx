import { render, screen, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import App from "./App"
import { Todo } from "./chunky-types"

// Create mock types for testing
interface MockDragEndEvent {
  active: { id: number }
  over: { id: number } | null
}

// Mock CSS imports
jest.mock("./App.css")

// Mock the DnD functionality
jest.mock("@dnd-kit/core", () => {
  const original = jest.requireActual("@dnd-kit/core")
  return {
    ...original,
    DndContext: ({
      children,
      onDragEnd,
    }: {
      children: React.ReactNode
      onDragEnd: (event: MockDragEndEvent) => void
    }) => {
      // Store the onDragEnd handler so we can call it in our tests
      ;(
        global as unknown as { mockDragEnd: (event: MockDragEndEvent) => void }
      ).mockDragEnd = onDragEnd
      return <div data-testid="dnd-context">{children}</div>
    },
  }
})

jest.mock("@dnd-kit/sortable", () => {
  const actual = jest.requireActual("@dnd-kit/sortable")
  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sortable-context">{children}</div>
    ),
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    }),
  }
})

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
})

describe("App - Todo Reordering", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock localStorage to return empty arrays
    mockLocalStorage.getItem.mockImplementation((keyStr: string) => {
      if (keyStr === "chunkylist-todos") return JSON.stringify([])
      if (keyStr === "chunkylist-completed") return JSON.stringify([])
      if (keyStr === "chunkylist-title") return "ChunkyList"
      return null
    })
  })

  it("maintains the order of todos in localStorage after reordering", async () => {
    // Mock localStorage to return predefined todos
    const predefinedTodosArr: Todo[] = [
      { id: 1, textStr: "Task 1", isCompleted: false, isSelected: false },
      { id: 2, textStr: "Task 2", isCompleted: false, isSelected: false },
      { id: 3, textStr: "Task 3", isCompleted: false, isSelected: false },
    ]

    mockLocalStorage.getItem.mockImplementation((keyStr: string) => {
      if (keyStr === "chunkylist-todos")
        return JSON.stringify(predefinedTodosArr)
      if (keyStr === "chunkylist-completed") return JSON.stringify([])
      if (keyStr === "chunkylist-title") return "ChunkyList"
      return null
    })

    render(<App />)

    // Wait for todos to be rendered
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument()
      expect(screen.getByText("Task 2")).toBeInTheDocument()
      expect(screen.getByText("Task 3")).toBeInTheDocument()
    })

    // Simulate reordering: Move the first todo to the end
    await act(async () => {
      const mockDragEndEvent: MockDragEndEvent = {
        active: { id: 1 },
        over: { id: 3 },
      }

      // Call the onDragEnd handler directly
      ;(
        global as unknown as { mockDragEnd: (event: MockDragEndEvent) => void }
      ).mockDragEnd(mockDragEndEvent)
    })

    // Wait for the state to update
    await waitFor(() => {
      // Check that localStorage.setItem was called with the new order
      const lastSetItemCallArr: string[] = mockLocalStorage.setItem.mock.calls
        .filter((call) => call[0] === "chunkylist-todos")
        .pop()

      const updatedTodosArr = JSON.parse(lastSetItemCallArr[1])

      // The expected order should be: Task 2, Task 3, Task 1
      expect(updatedTodosArr[0].textStr).toBe("Task 2")
      expect(updatedTodosArr[1].textStr).toBe("Task 3")
      expect(updatedTodosArr[2].textStr).toBe("Task 1")
    })
  })

  it("preserves todo properties when reordering", async () => {
    // Mock localStorage with todos that have various properties set
    const initialTodosArr: Todo[] = [
      { id: 1, textStr: "Task 1", isCompleted: false, isSelected: true },
      { id: 2, textStr: "Task 2", isCompleted: true, isSelected: false },
      { id: 3, textStr: "Task 3", isCompleted: false, isSelected: false },
    ]

    mockLocalStorage.getItem.mockImplementation((keyStr: string) => {
      if (keyStr === "chunkylist-todos") return JSON.stringify(initialTodosArr)
      if (keyStr === "chunkylist-completed") return JSON.stringify([])
      if (keyStr === "chunkylist-title") return "ChunkyList"
      return null
    })

    render(<App />)

    // Wait for todos to be rendered
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument()
      expect(screen.getByText("Task 2")).toBeInTheDocument()
      expect(screen.getByText("Task 3")).toBeInTheDocument()
    })

    // Simulate reordering: Move the second todo to the beginning
    await act(async () => {
      const mockDragEndEvent: MockDragEndEvent = {
        active: { id: 2 },
        over: { id: 1 },
      }

      // Call the onDragEnd handler directly
      ;(
        global as unknown as { mockDragEnd: (event: MockDragEndEvent) => void }
      ).mockDragEnd(mockDragEndEvent)
    })

    // Wait for the state to update
    await waitFor(() => {
      // Check that localStorage.setItem was called with the new order
      const lastSetItemCallArr: string[] = mockLocalStorage.setItem.mock.calls
        .filter((call) => call[0] === "chunkylist-todos")
        .pop()

      const updatedTodosArr: Todo[] = JSON.parse(lastSetItemCallArr[1])

      // The expected order should be: Task 2, Task 1, Task 3
      expect(updatedTodosArr[0].textStr).toBe("Task 2")
      expect(updatedTodosArr[1].textStr).toBe("Task 1")
      expect(updatedTodosArr[2].textStr).toBe("Task 3")

      // Check that properties are preserved
      expect(updatedTodosArr[0].isCompleted).toBe(true) // Task 2 was completed
      expect(updatedTodosArr[0].isSelected).toBe(false)

      expect(updatedTodosArr[1].isCompleted).toBe(false)
      expect(updatedTodosArr[1].isSelected).toBe(true) // Task 1 was selected

      expect(updatedTodosArr[2].isCompleted).toBe(false)
      expect(updatedTodosArr[2].isSelected).toBe(false)
    })
  })

  it("handles reordering when there are multiple drag operations", async () => {
    // Start with 5 todos
    const initialTodosArr: Todo[] = [
      { id: 1, textStr: "Task 1", isCompleted: false, isSelected: false },
      { id: 2, textStr: "Task 2", isCompleted: false, isSelected: false },
      { id: 3, textStr: "Task 3", isCompleted: false, isSelected: false },
      { id: 4, textStr: "Task 4", isCompleted: false, isSelected: false },
      { id: 5, textStr: "Task 5", isCompleted: false, isSelected: false },
    ]

    mockLocalStorage.getItem.mockImplementation((keyStr: string) => {
      if (keyStr === "chunkylist-todos") return JSON.stringify(initialTodosArr)
      if (keyStr === "chunkylist-completed") return JSON.stringify([])
      if (keyStr === "chunkylist-title") return "ChunkyList"
      return null
    })

    render(<App />)

    // Wait for todos to be rendered
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument()
      expect(screen.getByText("Task 5")).toBeInTheDocument()
    })

    // First reordering: Move Task 1 to position 3
    await act(async () => {
      const mockDragEndEvent: MockDragEndEvent = {
        active: { id: 1 },
        over: { id: 3 },
      }

      // Call the onDragEnd handler directly
      ;(
        global as unknown as { mockDragEnd: (event: MockDragEndEvent) => void }
      ).mockDragEnd(mockDragEndEvent)
    })

    // Wait for the state to update
    await waitFor(() => {
      const lastSetItemCall = mockLocalStorage.setItem.mock.calls
        .filter((call) => call[0] === "chunkylist-todos")
        .pop()

      const updatedTodosArr: Todo[] = JSON.parse(lastSetItemCall[1])

      // Expected order after first reordering: 2, 3, 1, 4, 5
      expect(updatedTodosArr.map((t: Todo) => t.id)).toEqual([2, 3, 1, 4, 5])
    })

    // Second reordering: Move Task 5 to the beginning
    await act(async () => {
      const mockDragEndEvent: MockDragEndEvent = {
        active: { id: 5 },
        over: { id: 2 },
      }

      // Call the onDragEnd handler directly
      ;(
        global as unknown as { mockDragEnd: (event: MockDragEndEvent) => void }
      ).mockDragEnd(mockDragEndEvent)
    })

    // Wait for the state to update
    await waitFor(() => {
      const lastSetItemCall = mockLocalStorage.setItem.mock.calls
        .filter((call) => call[0] === "chunkylist-todos")
        .pop()

      const updatedTodosArr: Todo[] = JSON.parse(lastSetItemCall[1])

      // Expected order after second reordering: 5, 2, 3, 1, 4
      expect(updatedTodosArr.map((t: Todo) => t.id)).toEqual([5, 2, 3, 1, 4])
    })
  })
})
