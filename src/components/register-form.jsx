import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import logo from "../assets/logo.png"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useCallback, useState } from "react"
import validator from "validator"
import axios from "axios"
import { toast } from "sonner"

export function RegisterForm({
	className,
	...props
}) {
	const navigate = useNavigate()

	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")

	const [usernameError, setUsernameError] = useState("")
	const [passwordError, setPasswordError] = useState("")
	const [passwordConfirmationError, setPasswordConfirmationError] = useState("")
	const [internalError, setInternalError] = useState("")

	const [isLoading, setIsLoading] = useState(false)

	const fetchRegister = useCallback(async (username, password, passwordConfirmation) => {
		try {
			setIsLoading(true)

			const res = await axios({
				method: "post",
				url: "http://ulasinaja.test/api/register",
				headers: {
					"Content-Type": "application/json",
				},
				data: {
					username,
					password,
					"password_confirmation": passwordConfirmation,
				},
			})

			const data = res.data.data

			localStorage.setItem("token", data.token)
			localStorage.setItem("user", JSON.stringify(data.user))

			toast.success("Register successfully")
			navigate("/menu")
		} catch (err) {
			toast.error("Register failed, please try again")
			console.error("Failed to register:", err)

			if (err.response.data.code === 422) {
				const message = err.response.data.errors

				setUsernameError(message?.username)
				setPasswordError(message?.password)
			}
		} finally {
			setIsLoading(false)
		}
	}, [navigate])

	const handleSubmit = (e) => {
		e.preventDefault()

		setUsernameError("")
		setPasswordError("")
		setPasswordConfirmationError("")
		setInternalError("")

		const errors = { username: "", password: "", passwordConfirmation: "" }

		if (validator.isEmpty(username)) {
			errors.username = "Username cannot be empty";
		} else if (username.length < 3) {
			errors.username = "Username must be at least 3 characters";
		} else if (username.length > 50) {
			errors.username = "Username must be at most 50 characters";
		}

		if (validator.isEmpty(password)) {
			errors.password = "Password cannot be empty";
		} else if (password.length < 6) {
			errors.password = "Password must be at least 6 characters";
		} else if (password.length > 50) {
			errors.password = "Password must be at most 50 characters";
		}

		if (validator.isEmpty(passwordConfirmation)) {
			errors.passwordConfirmation = "Password confirmation cannot be empty";
		} else if (passwordConfirmation.length < 6) {
			errors.passwordConfirmation = "Password confirmation must be at least 6 characters";
		} else if (passwordConfirmation.length > 50) {
			errors.passwordConfirmation = "Password confirmation must be at most 50 characters";
		} else if (passwordConfirmation !== password) {
			errors.passwordConfirmation = "Passwords do not match";
		}

		setUsernameError(errors.username)
		setPasswordError(errors.password)
		setPasswordConfirmationError(errors.passwordConfirmation)

		if (errors.username || errors.password || errors.passwordConfirmation) return

		fetchRegister(username, password, passwordConfirmation)
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden p-0 shadow-2xl">
				<CardContent className="grid p-0 md:grid-cols-2">
					<div className="relative hidden md:flex items-center justify-center">
						<img
							src={logo}
							alt="Image"
							className="h-full w-full object-contain dark:brightness-[0.9] dark:grayscale"
						/>
					</div>

					<form className="flex flex-col justify-center p-6 md:p-8" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							<div className="flex flex-col items-center text-center">
								<h1 className="text-2xl font-bold">Welcome</h1>
								<p className="text-muted-foreground text-balance">
									Register to your UlasinAja account
								</p>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="username">Username</Label>
								<Input id="username" type="text" required onChange={(e) => setUsername(e.target.value)} />
								{usernameError && (
									<p className="text-sm text-red-500">{usernameError}</p>
								)}
							</div>
							<div className="grid gap-3">
								<Label htmlFor="password">Password</Label>
								<Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} />
								{passwordError && (
									<p className="text-sm text-red-500">{passwordError}</p>
								)}
							</div>
							<div className="grid gap-3">
								<Label htmlFor="password_confirmation">Confirm Password</Label>
								<Input id="password_confirmation" type="password" required onChange={(e) => setPasswordConfirmation(e.target.value)} />
								{passwordConfirmationError && (
									<p className="text-sm text-red-500">{passwordConfirmationError}</p>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? (
									<div className="flex items-center justify-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Loading...
									</div>
								) : (
									"Register"
								)}
							</Button>
							{internalError && (
								<p className="text-sm text-red-500 text-center">{internalError}</p>
							)}
							<div
								className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
							>
								<span className="bg-card text-muted-foreground relative z-10 px-2">
									Or continue with
								</span>
							</div>
							<div className="text-center text-sm">
								Already have an account?{" "}
								<Link to="/login" className="underline underline-offset-4">
									Sign in
								</Link>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
