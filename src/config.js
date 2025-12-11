// Prefer Vite env, then CRA-style env, then localhost fallback
export const API_URL =
	import.meta?.env?.VITE_API_URL ||
	process.env?.REACT_APP_API_URL ||
	"http://127.0.0.1:8000";
