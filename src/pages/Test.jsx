import { useState } from "react"
import { Button } from "@/components/ui/button"
import axios from "axios"

export default function Test() {
    const [result, setResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showData, setShowData] = useState(false)

    const handleTest = async () => {
        setLoading(true)
        setError(null)
        setShowData(true)

        try {
            const res = await axios({
                method: 'post',
                url: 'http://localhost:8000/api/logout',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer 25|h22v3nOOiRq8SN3g1EdIdGRrtnmHOPqEO5FbmhUv14c76a60"
                },
                data: {
                    username: 'lagi',
                    password: 'lagi123'
                }
            })
            setResult(res.data)
            console.log(result)
        } catch (err) {
            setError(err.response.data || "Gagal fetch")
            console.log(err.response.data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gradient-to-br from-[#405DE6] via-[#e2d002] to-[#fb9200] flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-3xl bg-white/70 p-6 rounded shadow space-y-4 backdrop-blur-sm">
                <h1 className="text-xl font-bold">Daftar Review</h1>

                <Button onClick={handleTest} disabled={loading}>
                    {loading ? "Loading..." : "Test"}
                </Button>

                {showData && (
                    <>
                        {error && (
                            <div className="text-red-500 space-y-1">
                                <p>Error: {error.message || "Terjadi kesalahan"}</p>
                                {error.errors?.username && (
                                    <p>Username: {error.errors.username[0]}</p>
                                )}
                                {error.errors?.password && (
                                    <p>Password: {error.errors.password[0]}</p>
                                )}
                            </div>
                        )}

                        {!error && !loading && result.data.token && (
                            <div className="space-y-2">
                                <p>Message: {result.message}</p>
                                <p><strong>Token:</strong> {result.data.token}</p>
                                <p><strong>Username:</strong> {result.data.user?.username}</p>
                            </div>
                        )}

                    </>
                )}

            </div>
        </div>
    )
}
