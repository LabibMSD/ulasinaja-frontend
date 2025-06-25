import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="bg-gradient-to-br from-[#405DE6] via-[#e2d002] to-[#fb9200] flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <LoginForm />
            </div>
        </div>
    )
}
