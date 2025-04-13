import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import App from "./App"

// Mock CSS imports
jest.mock("./App.css")

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

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the title input and todo list", () => {
    render(<App />)
    // Check for todo list
    expect(screen.getByRole("list")).toBeInTheDocument()
  })

  it("adds a new todo", async () => {
    render(<App />)

    // Get the input and button
    const input = screen.getByPlaceholderText("Add a new task")
    const addButton = screen.getByText("Add")

    // Type in the input and click add
    fireEvent.change(input, { target: { value: "Test Task" } })
    fireEvent.click(addButton)

    // Wait for the todo to appear
    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument()
    })
  })

  it("toggles todo completion", async () => {
    render(<App />)

    // Add a todo
    const input = screen.getByPlaceholderText("Add a new task")
    const addButton = screen.getByText("Add")
    fireEvent.change(input, { target: { value: "Test Task" } })
    fireEvent.click(addButton)

    // Wait for the todo to appear
    await waitFor(() => {
      const todo = screen.getByText("Test Task")
      expect(todo).toBeInTheDocument()

      // Find the checkbox and click it
      const checkbox = todo.closest("li")?.querySelector("button")
      fireEvent.click(checkbox!)

      // Check if the task is completed
      expect(todo.closest("li")).toHaveClass("completed")
    })
  })

  it("deletes a todo", async () => {
    render(<App />)

    // Add a todo
    const input = screen.getByPlaceholderText("Add a new task")
    const addButton = screen.getByText("Add")
    fireEvent.change(input, { target: { value: "Test Task" } })
    fireEvent.click(addButton)

    // Wait for the todo to appear
    await waitFor(() => {
      const todo = screen.getByText("Test Task")
      expect(todo).toBeInTheDocument()

      // Find and click the delete button
      const deleteButton = todo.closest("li")?.querySelector(".delete-btn")
      fireEvent.click(deleteButton!)

      // Check if the todo is removed
      expect(todo).not.toBeInTheDocument()
    })
  })

  it("saves todos to localStorage", async () => {
    render(<App />)

    // Add a todo
    const input = screen.getByPlaceholderText("Add a new task")
    const addButton = screen.getByText("Add")
    fireEvent.change(input, { target: { value: "Test Task" } })
    fireEvent.click(addButton)

    // Wait for the todo to appear
    await waitFor(() => {
      const todo = screen.getByText("Test Task")
      expect(todo).toBeInTheDocument()

      // Check if localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      )
    })
  })
})
