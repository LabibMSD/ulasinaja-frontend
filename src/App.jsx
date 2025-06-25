import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import LoginPage from "./pages/LoginPage.jsx"
import RegisterPage from "./pages/RegisterPage.jsx"
import MenuPage from "./pages/MenuPage.jsx"
import AdminPage from "./pages/AdminPage.jsx"
import Test from "./pages/Test.jsx"
import { useEffect, useState } from "react"

function AppRoutes() {
	const [user, setUser] = useState(null)
	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		const storedUser = localStorage.getItem("user")
		const storedToken = localStorage.getItem("token")

		if (storedUser && storedToken) {
			const parsedUser = JSON.parse(storedUser)
			setUser(parsedUser)

			if (location.pathname === "/" || location.pathname === "/login") {
				if (parsedUser.role === "admin") {
					navigate("/admin")
				} else {
					navigate("/menu")
				}
			}
		}
	}, [navigate, location.pathname])

	const isAuthenticated = !!user

	return (
		<Routes>
			<Route path="/" element={<Navigate to="/menu" />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/test" element={<Test />} />
			<Route path="/menu" element={isAuthenticated ? <MenuPage /> : <Navigate to="/login" />} />
			<Route path="/admin" element={<AdminPage />} />
			<Route path="*" element={<div>404 Not Found</div>} />
		</Routes>
	)
}

export default function App() {
	return (
		<Router>
			<AppRoutes />
		</Router>
	)
}
