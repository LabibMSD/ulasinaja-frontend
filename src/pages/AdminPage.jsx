import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"


export default function AdminPage() {
    const [reviews, setReviews] = useState([])
    const [isSkeletonLoading, setSkeletonLoading] = useState(true)
    const [isDeleteLoading, setIsDeleteLoading] = useState(null)
    const [isLogoutLoading, setIsLogoutLoading] = useState(false)

    const [deleteId, setDeleteId] = useState(null)

    const user = JSON.parse(localStorage.getItem("user"))
    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    const fetchReviews = useCallback(async () => {
        if (!token) return
        try {
            const res = await axios({
                method: "get",
                url: "http://ulasinaja.test/api/review",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            setReviews(res.data.data || [])
        } catch (err) {
            toast.error("Failed to fetch reviews")
            console.error("Error fetching reviews", err)
        } finally {
            setSkeletonLoading(false)
        }
    }, [token])

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    const handleDelete = async (id) => {
        setIsDeleteLoading(id)
        try {
            await axios({
                method: "delete",
                url: `http://ulasinaja.test/api/review/${id}`,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            setReviews((prev) => prev.filter((r) => r.id !== id))
            toast.success("Review deleted successfully")
        } catch (err) {
            toast.error("Failed to delete review")
            console.error("Error deleting review", err)
        } finally {
            setIsDeleteLoading(null)
        }
    }

    const fetchLogout = useCallback(async () => {
        try {
            setIsLogoutLoading(true)

            await axios({
                method: "post",
                url: "http://ulasinaja.test/api/logout",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
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
    }, [navigate, token])

    useEffect(() => {
        if (typeof user?.role === "undefined") return; // tunggu user.role terdefinisi

        if (user.role !== "admin") {
            toast.error("Access denied. Only admin allowed.")
            navigate("/menu")
        }
    }, [user, navigate])


    return (
        <div className="min-h-screen bg-gradient-to-br from-[#405DE6] via-[#e2d002] to-[#fb9200] text-foreground p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-white">UlasinAja - Admin</h1>

                <div className="flex items-center gap-4">
                    <h2 className="text-black text-sm">Hello, {user?.username}</h2>
                    <Button variant="secondary" onClick={() => navigate("/menu")}>Menu</Button>
                    <Button variant="destructive" onClick={fetchLogout} disabled={isLogoutLoading}>
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
                                <p className="text-sm text-black">
                                    Username: <span className="font-semibold text-blue-700">
                                        {review.user?.username || review.username || "Unknown"}
                                    </span>
                                </p>

                                <p className="text-muted-foreground">{review.message}</p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => setDeleteId(review.id)}
                                        >
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the review.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(deleteId)}
                                                disabled={isDeleteLoading === deleteId}
                                            >
                                                {isDeleteLoading === deleteId ? "Loading..." : "Yes, delete"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground mb-4">
                        <p className="mb-4">No reviews available.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
