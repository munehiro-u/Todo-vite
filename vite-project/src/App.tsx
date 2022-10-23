import { useEffect, useState } from "react";

type Todo = {
  value: string;
  readonly id: number;
  checked: boolean;
  removed: boolean;
  detail: string;
};

type Filter = "all" | "checked" | "unchecked" | "removed";

export const App = () => {
  const [text, setText] = useState("");
  const [detail, setDetail] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const newhandleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetail(e.target.value);
  };

  const handleOnSubmit = () => {
    if (!text) return;

    const newTodo: Todo = {
      value: text,
      detail: detail,
      id: new Date().getTime(),
      checked: false,
      removed: false,
    };

    setTodos([newTodo, ...todos]);
    setText("");
    setDetail("");
  };

  const handleOnEdit = (props: {
    id: number;
    value?: string;
    detail?: string;
  }) => {
    const { id, value, detail } = props;
    const deepCopy = todos.map((todo) => ({ ...todo }));
    const newTodos = deepCopy.map((todo) => {
      if (todo.id === id) {
        // valueもdetailも「?」をつけているため、undefinedの可能性がある
        // undefinedの場合は元のvalueやdetailを入れる
        // undefinedではない（ = 新しく入力された値がある）場合はそれに更新する
        todo.value = value !== undefined ? value : todo.value;
        todo.detail = detail !== undefined ? detail : todo.detail;
      }
      return todo;
    });
    setTodos(newTodos);
  };

  const handleOnCheck = (id: number, checked: boolean) => {
    const deepCopy = todos.map((todo) => ({ ...todo }));

    const newTodos = deepCopy.map((todo) => {
      if (todo.id === id) {
        todo.checked = !checked;
      }
      return todo;
    });

    setTodos(newTodos);
  };

  const handleOnRemove = (id: number, removed: boolean) => {
    const deepCopy = todos.map((todo) => ({ ...todo }));

    const newTodos = deepCopy.map((todo) => {
      if (todo.id === id) {
        todo.removed = !removed;
      }
      return todo;
    });

    setTodos(newTodos);
  };

  const handleOnEmpty = () => {
    const newTodos = todos.filter((todo) => !todo.removed);
    setTodos(newTodos);
  };

  // 初めの書き方だと、todoが更新されてもfilteredTodosは更新されないため、新たにfilteredTodosをstateとして定義
  // それをtodosがfilterが変わったタイミングで更新
  useEffect(() => {
    const filteredTodos = todos.filter((todo) => {
      switch (filter) {
        case "all":
          return !todo.removed;
        case "checked":
          return todo.checked && !todo.removed;
        case "unchecked":
          return !todo.checked && !todo.removed;
        case "removed":
          return todo.removed;
        default:
          return todo;
      }
    });
    setFilteredTodos(filteredTodos);
  }, [filter, todos]);

  return (
    <div>
      <h1>TodoLisit</h1>
      <select
        defaultValue="all"
        onChange={(e) => setFilter(e.target.value as Filter)}
      >
        <option value="all">すべてのタスク</option>
        <option value="checked">完了したタスク</option>
        <option value="unchecked">進行中のタスク</option>
        <option value="removed">ごみ箱</option>
      </select>
      {filter === "removed" ? (
        <button
          onClick={handleOnEmpty}
          disabled={todos.filter((todo) => todo.removed).length === 0}
        >
          ごみ箱を空にする
        </button>
      ) : (
        filter !== "checked" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOnSubmit();
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => handleOnChange(e)}
            />
            <input
              type="text"
              value={detail}
              onChange={(e) => newhandleOnChange(e)}
            />
            <input type="submit" value="追加" />
          </form>
        )
      )}
      <ul>
        {filteredTodos.map((todo) => {
          return (
            <li key={todo.id}>
              <input
                type="checkbox"
                disabled={todo.removed}
                checked={todo.checked}
                onChange={() => handleOnCheck(todo.id, todo.checked)}
              />
              <input
                type="text"
                value={todo.value}
                disabled={todo.checked || todo.removed}
                onChange={(e) => {
                  handleOnEdit({ id: todo.id, value: e.target.value });
                }}
              />
              <input
                type="text"
                disabled={todo.checked || todo.removed}
                value={todo.detail}
                onChange={(e) =>
                  handleOnEdit({ id: todo.id, detail: e.target.value })
                }
              />
              <button onClick={() => handleOnRemove(todo.id, todo.removed)}>
                {todo.removed ? "復元" : "削除"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};