import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons"
import { CompletedTodosProps } from "../chunky-types"

export function CompletedTodos({ todos }: CompletedTodosProps) {
  return (
    <div className="completed-section">
      <ul className="todo-list completed-list">
        {todos.map((todo) => (
          <li key={todo.id} className="completed">
            <button className="checkbox-btn">
              <FontAwesomeIcon icon={faCircleCheck} className="completed" />
            </button>
            <span>{todo.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
