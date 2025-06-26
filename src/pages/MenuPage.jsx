import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

export default function MenuPage() {
    const [reviews, setReviews] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [editedContent, setEditedContent] = useState("")

    const [editError, setEditError] = useState("")

    const [showForm, setShowForm] = useState(false)
    const [newReview, setNewReview] = useState("")

    const [isSendSubmitLoading, setIsSendSubmitLoading] = useState(false)
    const [isLogoutLoading, setIsLogoutLoading] = useState(false)
    const [isEditLoading, setIsEditLoading] = useState(false)
    const [isSkeletonLoading, setSkeletonLoading] = useState(true)

    const user = JSON.parse(localStorage.getItem("user"))
    const token = localStorage.getItem("token")

    const isAdmin = user?.role === "admin"

    const navigate = useNavigate()

    const fetchLogout = useCallback(async (token) => {
        try {
            setIsLogoutLoading(true)

            await axios({
                method: "post",
                url: "https://ulasinaja.up.railway.app/api/logout",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })

            localStorage.removeItem("token")
            localStorage.removeItem("user")

            toast.success("Logout successfully")
            navigate("/login")
        } catch (err) {
            toast.error("Logout failed, try again")
            console.log("Failed to logout", err)
        } finally {
            setIsLogoutLoading(false)
        }
    }, [navigate])

    const handleLogout = () => {
        fetchLogout(token)
    }

    const fetchReviews = useCallback(async () => {
        if (!token) return
        try {
            const res = await axios({
                method: "get",
                url: "https://ulasinaja.up.railway.app/api/user/review",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })

            setReviews(res.data.data || [])
        } catch (err) {
            toast.error("Failed to fetch reviews, refresh the page")
            console.log("Failed to fetch reviews", err)
        } finally {
            setSkeletonLoading(false)
        }
    }, [token])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    const handleEditClick = (review) => {
        setEditingId(review.id)
        setEditedContent(review.message)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditedContent("")
    }

    const handleSaveEdit = async (id) => {
        if (!editedContent.trim()) return setEditError("Review cannot be empty")

        try {
            setIsEditLoading(true)

            const res = await axios({
                method: "put",
                url: `https://ulasinaja.up.railway.app/api/review/${id}`,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                data: {
                    message: editedContent.trim(),
                },
            })

            setReviews((prev) =>
                prev.map((rev) =>
                    rev.id === id ? { ...rev, message: res.data.data.message } : rev
                )
            )

            toast.success("Review updated successfully")
            setEditingId(null)
            setEditedContent("")
            setEditError("")
        } catch (err) {
            console.error("Failed to update review:", err)
            toast.error("Failed to update review")
        } finally {
            setIsEditLoading(false)
        }
    }

    const handleSendToggle = () => {
        setShowForm((prev) => !prev)
        setNewReview("")
    }

    const handleSendSubmit = useCallback(async () => {
        if (!newReview.trim()) return

        setIsSendSubmitLoading(true)

        try {
            const res = await axios({
                method: "post",
                url: "https://ulasinaja.up.railway.app/api/review",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                data: {
                    message: newReview.trim(),
                },
            })

            setReviews((prev) => [...prev, res.data.data])
            setNewReview("")
            setShowForm(false)
            setIsSendSubmitLoading(false)

            toast.success("Review sent successfully")
        } catch (err) {
            toast.error("Failed to send review")
            console.log("Failed to send review", err)
        }
    }, [newReview, token])

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#405DE6] via-[#e2d002] to-[#fb9200] text-foreground p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-white">UlasinAja - Menu</h1>

                <div className="flex items-center gap-4">
                    <h2 className="text-black text-sm">Hello, {user?.username}</h2>
                    {isAdmin && <Button variant="secondary" onClick={() => navigate("/admin")}>Admin</Button>}
                    <Button variant="destructive" onClick={handleLogout} disabled={isLogoutLoading}>
                        {isLogoutLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Loading...
                            </div>
                        ) : (
                            "Logout"
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {isSkeletonLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                        <Card key={idx} className="shadow-2xl">
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <Card key={review.id} className="shadow-2xl">
                            <CardContent className="p-4 space-y-2">
                                {editingId === review.id ? (
                                    <>
                                        <Input
                                            value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}
                                        />
                                        {editError && (
                                            <p className="text-sm text-red-500">{editError}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleSaveEdit(review.id)}>
                                                {isEditLoading ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        Loading...
                                                    </div>
                                                ) : (
                                                    "Edit"
                                                )}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-muted-foreground">{review.message}</p>
                                        <Button size="sm" variant="outline" onClick={() => handleEditClick(review)}>Edit</Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground mb-4">
                        <p className="mb-4">You have no reviews yet.</p>
                    </div>
                )}

                {showForm && (
                    <Card>
                        <CardContent className="p-4 space-y-2">
                            <Input
                                placeholder="Write your review..."
                                value={newReview}
                                onChange={(e) => setNewReview(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleSendSubmit} disabled={isSendSubmitLoading}>
                                    {isSendSubmitLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Loading...
                                        </div>
                                    ) : (
                                        "Send"
                                    )}
                                </Button>
                                <Button variant="outline" onClick={handleSendToggle}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="mt-8 text-center">
                <Button onClick={handleSendToggle} className="bg-[#304cd9]">
                    {showForm ? "Close Form" : "+ Send Review Baru"}
                </Button>
            </div>
        </div>
    )
}
