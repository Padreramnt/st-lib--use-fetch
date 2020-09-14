# React fetch hook

```tsx
import * as React from 'react'
import TodoItem from './TodoItem'
import useFetch from '@st-lib/use-fetch'

const DEFAULT_FIRST = 50
const DEFAULT_OFFSET = 0

function useTodos({ first = DEFAULT_FIRST, offset = DEFAULT_OFFSET }: { first?: number, offset?: number }, deps?: React.DependencyList) {
	return useFetch(res => ({
		ok: res.ok,
		status: res.status,
		statusText: res.statusText,
		data: res.json()
	}), `/todos?first=${first}&offset=${offset})`, null, deps)
}

const DEFAULT_RETRY_DELAY = 10
const DEFAULT_RETRY_COUNT = 5

export default function TodoList() {
	const [offset, setOffset] = React.useState(DEFAULT_OFFSET)

	const [reload, setReload] = React.useState(Symbol())
	const [retryCount, setRetryCount] = React.useState(DEFAULT_RETRY_COUNT)
	const [retryDelay, setRetryDelay] = React.useState(DEFAULT_RETRY_DELAY)

	const retry = React.useCallback(() => {
		setReload(Symbol())
		setRetryCount(DEFAULT_RETRY_COUNT)
	}, [DEFAULT_RETRY_COUNT])
	const todos = useTodos({ offset }, [reload, retryCount])

	const next = React.useCallback(() => {
		setOffset(offset + DEFAULT_FIRST)
	}, [DEFAULT_FIRST])
	const prev = React.useCallback(() => {
		setOffset(offset - DEFAULT_FIRST)
	}, [DEFAULT_FIRST])

	React.useEffect(() => {
		if (todos.loading || !todos.error || !retryCount) return
		setRetryDelay(DEFAULT_RETRY_DELAY)
		const id = setInterval(() => {
			if (retryDelay) {
				setRetryDelay(retryDelay - 1)
			} else {
				setRetryCount(retryCount - 1)
			}
		}, 1000)
		return () => clearInterval(id)
	}, [todos.error, todos.loading])

	if (todos.error) {
		return (
			<span className='error'>
				{`Network error, `}
				<button onClick={retry} disabled={todos.loading}>
					{`retry in ${retryDelay}s`}
				</button>
			</span>
		)
	} else if (todos.result && todos.result.ok) {
		return (
			<div className='todolist'>
				{todos.result.data.map(item => <TodoItem key={item.id} item={item} />)}
				<button onClick={prev} disabled={todos.loading}>
					{'prev'}
				</button>
				<button onClick={next} disabled={todos.loading}>
					{'next'}
				</button>
			</div>
		)
	} else if (todos.result && !todos.result.ok) {
		return (
			<span className='error'>
				{`${todos.result.status < 500 ? 'Client' : 'Service'} error ${todos.result.data.code ?? todos.result.status}: ${todos.result.data.message ?? todos.result.statusText} `}
				<button onClick={retry} disabled={todos.loading} hidden={todos.result.status < 500}>
					{'retry'}
				</button>
			</span>
		)
	} else {
		return (
			<span>
				{'Loading'}
			</span>
		)
	}
}
```