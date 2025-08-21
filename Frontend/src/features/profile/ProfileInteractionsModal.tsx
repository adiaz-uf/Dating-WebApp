import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { FaEye } from "react-icons/fa";
import { fetchUserRecievedLikes, fetchUserRecievedViews } from "../../api/profile_service";
import { setViewedProfile } from "../../api/user_service";
import { connectNotificationSocket, getNotificationSocket, onNotificationSocketRegistered } from "../../api/notifications_socket";

interface UserLikeView {
	id: string;
	first_name?: string;
	last_name?: string;
	username: string;
	main_img?: string;
}

interface ProfileInteractionsModalProps {
  onClose: () => void;
}


export default function ProfileInteractionsModal ({onClose}: ProfileInteractionsModalProps) {
	const [showLikes, setShowLikes] = useState(true);
	const [showViews, setShowViews] = useState(false);
	const [loading, setLoading] = useState(false);
	const [recievedLikes, setRecievedLikes] = useState<UserLikeView[]>([]);
	const [recievedViews, setRecievedViews] = useState<UserLikeView[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchRecievedLikes = async () => {
			setLoading(true);
			try {
				const data = await fetchUserRecievedLikes();
				if (data && data.success && Array.isArray(data.users)) {
					setRecievedLikes(data.users);
				} else {
					setRecievedLikes([]);
				}
			} catch (err) {
				setRecievedLikes([]);
			} finally {
				setLoading(false);
			}
		};

		const fetchRecievedViews = async () => {
			setLoading(true);
			try {
				const data = await fetchUserRecievedViews();
				if (data && data.success && Array.isArray(data.users)) {
					setRecievedViews(data.users);
				} else {
					setRecievedViews([]);
				}
			} catch (err) {
				setRecievedViews([]);
			} finally {
				setLoading(false);
			}
		};
		fetchRecievedViews();
		fetchRecievedLikes();
	}, []);

	const handleViewProfile = async (user_id: any) => {
		try {
			await setViewedProfile({ viewed_id: user_id });
			const fromId = localStorage.getItem("userId");
			if (fromId && user_id) {
				connectNotificationSocket(fromId);
				onNotificationSocketRegistered(() => {
					const socket = getNotificationSocket();
					if (socket && socket.connected) {
						socket.emit("send_reminder", {
							to: user_id,
							from: fromId,
							type: "view",
							content: ` viewed your profile`,
						});
					}
				});
			}
			navigate(`/profile/${user_id}`)
		} catch (err: any) {
				console.error("Error creating profile view:", err);
		}
	}

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
			<div className="bg-pink-100 rounded-3xl mx-2 w-full max-w-2xl shadow-xl overflow-y-auto scroll-hidden  h-150 max-h-[90vh]">
				<div className="flex justify-between items-center mb-4">
					{showLikes && (
						<h2 className="text-2xl font-semibold text-pink-600 m-6">Recieved Likes</h2>
					)}
					{showViews && (
						<h2 className="text-2xl font-semibold text-pink-600 m-6">People who viewed your profile</h2>
					)}
					<button onClick={onClose} className="text-3xl m-6 font-bold text-gray-400 hover:text-pink-600">&times;</button>
				</div>
				<div className="flex justify-around">
					<Button variant="none" 
						className={`text-pink-600 border border-pink-300 !rounded-none py-6 w-full hover:scale-none active:scale-none ${
							showLikes ? "bg-pink-200 font-semibold" : "hover:bg-pink-100"
						}`}
						onClick={() => { setShowLikes(true); setShowViews(false); }}>
						Likes
					</Button>
					<Button variant="none" 
						className={`text-pink-600 border border-pink-300 !rounded-none py-6 w-full hover:scale-none active:scale-none ${
							showViews ? "bg-pink-200 font-semibold" : "hover:bg-pink-100"
						}`}
						onClick={() => { setShowLikes(false); setShowViews(true); }}>
						Views
					</Button>
				</div>
				{/* Persons who liked profile */}
				{showLikes && (
					<div className="space-y-2 px-6 py-6 bg-pink-200 h-full">
						{loading && <div>Loading...</div>}
						{!loading && recievedLikes.length === 0 && <div>No likes yet.</div>}
						{recievedLikes.map(user => (
							<div key={user.id} className="flex items-center gap-4 p-2 bg-white rounded-xl shadow-sm">
								<img src={user.main_img || "/avatars/default.jpg"} alt={user.first_name || user.username} className="w-10 h-10 rounded-full object-cover" />
								<div>
									<p className="font-semibold text-pink-700">{user.first_name ? user.first_name : user.username}</p>
									<p className="text-sm text-gray-500">@{user.username}</p>
								</div>
								<Button
									onClick={() => handleViewProfile(user.id)}
									variant="none"
									className="cursor-pointer ml-auto text-2xl text-pink-600">
									<FaEye />
								</Button>
							</div>
						))}
					</div>
				)}
				{/* Persons who visited profile */}
				{showViews && (
					<div className="space-y-2 px-6 py-6 bg-pink-200 h-full">
						{loading && <div>Loading...</div>}
						{!loading && recievedViews.length === 0 && <div>No profile views yet.</div>}
						{recievedViews.map(user => (
							<div key={user.id} className="flex items-center gap-4 p-2 bg-white rounded-xl shadow-sm">
								<img src={user.main_img || "/avatars/default.jpg"} alt={user.first_name || user.username} className="w-10 h-10 rounded-full object-cover" />
								<div>
									<p className="font-semibold text-pink-700">{user.first_name ? user.first_name : user.username}</p>
									<p className="text-sm text-gray-500">@{user.username}</p>
								</div>
								<Button
									onClick={() => handleViewProfile(user.id)}
									variant="none"
									className="cursor-pointer ml-auto text-2xl text-pink-600">
									<FaEye />
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}