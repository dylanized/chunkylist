import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons"
import { ArchivedTodosProps } from "../chunky-types"

export function ArchivedTodos({ todosArr: todosArr }: ArchivedTodosProps) {
  return (
    <div className="archived-section">
      <ul className="todo-list archived-list">
        {todosArr.map((todo) => (
          <li key={todo.idInt} className="completed">
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
