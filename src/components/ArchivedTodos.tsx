import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons"
import { ArchivedTodosProps as ArchivedTodosProps } from "../chunky-types"

export function ArchivedTodos({ todosArr }: ArchivedTodosProps) {
  return (
    <div className="completed-section">
      <ul className="todo-list completed-list">
        {todosArr.map((todo) => (
          <li key={todo.id} className="completed">
            <button className="checkbox-btn">
              <FontAwesomeIcon icon={faCircleCheck} className="completed" />
            </button>
            <span>{todo.textStr}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
