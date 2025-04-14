import { render, screen, waitFor, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import App from "./App"

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
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "chunkylist-todos") return JSON.stringify([])
      if (key === "chunkylist-completed") return JSON.stringify([])
      if (key === "chunkylist-title") return "ChunkyList"
      return null
    })
  })

  it("maintains the order of todos in localStorage after reordering", async () => {
    // Mock localStorage to return predefined todos
    const predefinedTodos = [
      { id: 1, text: "Task 1", completed: false, isSelected: false },
      { id: 2, text: "Task 2", completed: false, isSelected: false },
      { id: 3, text: "Task 3", completed: false, isSelected: false },
    ]

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "chunkylist-todos") return JSON.stringify(predefinedTodos)
      if (key === "chunkylist-completed") return JSON.stringify([])
      if (key === "chunkylist-title") return "ChunkyList"
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
      const lastSetItemCall = mockLocalStorage.setItem.mock.calls
        .filter((call) => call[0] === "chunkylist-todos")
        .pop()

      const updatedTodos = JSON.parse(lastSetItemCall[1])

      // The expected order should be: Task 2, Task 3, Task 1
      expect(updatedTodos[0].text).toBe("Task 2")
      expect(updatedTodos[1].text).toBe("Task 3")
      expect(updatedTodos[2].text).toBe("Task 1")
    })
  })

  it("preserves todo properties when reordering", async () => {
    // Mock localStorage with todos that have various properties set
    const initialTodos = [
      { id: 1, text: "Task 1", completed: false, isSelected: true },
      { id: 2, text: "Task 2", completed: true, isSelected: false },
      { id: 3, text: "Task 3", completed: false, isSelected: false },
    ]

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "chunkylist-todos") return JSON.stringify(initialTodos)
      if (key === "chunkylist-completed") return JSON.stringify([])
      if (key === "chunkylist-title") return "ChunkyList"
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
      const lastSetItemCall = mockLocalStorage.setItem.mock.calls
        .filter((call) => call[0] === "chunkylist-todos")
        .pop()

      const updatedTodos = JSON.parse(lastSetItemCall[1])

      // The expected order should be: Task 2, Task 1, Task 3
      expect(updatedTodos[0].text).toBe("Task 2")
      expect(updatedTodos[1].text).toBe("Task 1")
      expect(updatedTodos[2].text).toBe("Task 3")

      // Check that properties are preserved
      expect(updatedTodos[0].completed).toBe(true) // Task 2 was completed
      expect(updatedTodos[0].isSelected).toBe(false)

      expect(updatedTodos[1].completed).toBe(false)
      expect(updatedTodos[1].isSelected).toBe(true) // Task 1 was selected

      expect(updatedTodos[2].completed).toBe(false)
      expect(updatedTodos[2].isSelected).toBe(false)
    })
  })

  it("handles reordering when there are multiple drag operations", async () => {
    // Start with 5 todos
    const initialTodos = [
      { id: 1, text: "Task 1", completed: false, isSelected: false },
      { id: 2, text: "Task 2", completed: false, isSelected: false },
      { id: 3, text: "Task 3", completed: false, isSelected: false },
      { id: 4, text: "Task 4", completed: false, isSelected: false },
      { id: 5, text: "Task 5", completed: false, isSelected: false },
    ]

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "chunkylist-todos") return JSON.stringify(initialTodos)
      if (key === "chunkylist-completed") return JSON.stringify([])
      if (key === "chunkylist-title") return "ChunkyList"
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

      const updatedTodos = JSON.parse(lastSetItemCall[1])

      // Expected order after first reordering: 2, 3, 1, 4, 5
      expect(updatedTodos.map((t: { id: number }) => t.id)).toEqual([
        2, 3, 1, 4, 5,
      ])
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

      const updatedTodos = JSON.parse(lastSetItemCall[1])

      // Expected order after second reordering: 5, 2, 3, 1, 4
      expect(updatedTodos.map((t: { id: number }) => t.id)).toEqual([
        5, 2, 3, 1, 4,
      ])
    })
  })
})
