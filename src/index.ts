import useAsyncMemo from '@st-lib/use-async-memo'
import { useMemo, DependencyList } from 'react'

function newAbortController() {
	return new AbortController()
}

const defaultDeps: DependencyList = []

export interface Config {
	fetch?: null | typeof fetch
	Request?: null | typeof Request
}

export function useFetch<T>(
	cb: (response: Response) => Promise<T>,
	input: RequestInfo,
	init: RequestInit | null = null,
	deps: DependencyList = defaultDeps,
	config: Config | null = null
) {
	const _fetch = config?.fetch ?? fetch
	const _Request = config?.Request ?? Request
	return useAsyncMemo(() => _fetch(null == init ? new _Request(input) : new _Request(input, init)).then(cb), [
		_fetch,
		_Request,
		init?.body,
		init?.cache,
		init?.credentials,
		init?.headers,
		init?.integrity,
		init?.keepalive,
		init?.method,
		init?.mode,
		init?.redirect,
		init?.referrer,
		init?.referrerPolicy,
		init?.window,
		input,
	].concat(Array.isArray(deps) ? deps : typeof deps === 'object' && null != deps && 'length' in deps ? Array.from(deps) : [deps]))
}

export function useAbortController(deps: DependencyList = defaultDeps) {
	return useMemo(newAbortController, deps)
}