"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEARCH_REPLACE_EXAMPLE_CONVERSATION = exports.assistant2 = exports.assistant1 = void 0;
const format_1 = require("../format");
const user1 = 'Create a new TodoList component with basic functionality';
const projectPath = '/path/to/your/project';
exports.assistant1 = `Let's create a new TodoList component with basic functionality:
1. Create the TodoList component with state management
2. Add the ability to toggle todo items
3. Include basic styling

Here's the updated code:

${projectPath}/components/TodoList.tsx
${format_1.FENCE.code.start}tsx
${format_1.FENCE.searchReplace.start}
${format_1.FENCE.searchReplace.middle}
import { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build Todo App', completed: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} className="flex items-center gap-2 p-2">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span className={todo.completed ? 'line-through' : ''}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
${format_1.FENCE.searchReplace.end}
${format_1.FENCE.code.end}
`;
const user2 = 'Refactor the TodoList by extracting the TodoItem into its own component';
exports.assistant2 = `Let's refactor the TodoList by extracting the TodoItem into its own component:
1. Create a new TodoItem component
2. Move the item rendering logic to the new component
3. Update the TodoList to use the new component

Here's the updated code:

${projectPath}/components/TodoItem.tsx
${format_1.FENCE.code.start}tsx
${format_1.FENCE.searchReplace.start}
${format_1.FENCE.searchReplace.middle}
interface TodoItemProps {
  id: number;
  text: string;
  completed: boolean;
  onToggle: (id: number) => void;
}

export function TodoItem({ id, text, completed, onToggle }: TodoItemProps) {
  return (
    <li className="flex items-center gap-2 p-2">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(id)}
      />
      <span className={completed ? 'line-through' : ''}>
        {text}
      </span>
    </li>
  );
}
${format_1.FENCE.searchReplace.end}
${format_1.FENCE.code.end}

${projectPath}/components/TodoList.tsx
${format_1.FENCE.code.start}tsx
${format_1.FENCE.searchReplace.start}
import { useState } from 'react';
${format_1.FENCE.searchReplace.middle}
import { useState } from 'react';
import { TodoItem } from './TodoItem';
${format_1.FENCE.searchReplace.end}
${format_1.FENCE.code.end}

${projectPath}/components/TodoList.tsx
${format_1.FENCE.code.start}tsx
${format_1.FENCE.searchReplace.start}
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} className="flex items-center gap-2 p-2">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span className={todo.completed ? 'line-through' : ''}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
${format_1.FENCE.searchReplace.middle}
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          {...todo}
          onToggle={toggleTodo}
        />
      ))}
    </ul>
  );
}
${format_1.FENCE.searchReplace.end}
${format_1.FENCE.code.end}`;
exports.SEARCH_REPLACE_EXAMPLE_CONVERSATION = [
    {
        role: 'user',
        content: user1,
    },
    {
        role: 'assistant',
        content: exports.assistant1,
    },
    {
        role: 'user',
        content: user2,
    },
    {
        role: 'assistant',
        content: exports.assistant2,
    },
];
//# sourceMappingURL=example.js.map