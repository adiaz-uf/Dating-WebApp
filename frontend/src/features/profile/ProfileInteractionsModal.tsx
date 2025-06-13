import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { FaEye } from "react-icons/fa";

{/* TODO: test data */}
const mockLikes = [
  { id: 1, name: "Sofía Gómez", username: "sofi_g", avatar: "/avatars/1.jpg" },
  { id: 2, name: "Lucas Pérez", username: "lucasp", avatar: "/avatars/2.jpg" },
  { id: 3, name: "Valentina Ruiz", username: "valenruiz", avatar: "/avatars/3.jpg" },
];

const mockViews = [
  { id: 4, name: "Martín Torres", username: "martin.t", avatar: "/avatars/4.jpg" },
  { id: 5, name: "Ana López", username: "ana_l", avatar: "/avatars/5.jpg" },
  { id: 6, name: "Julián Fernández", username: "julianf", avatar: "/avatars/6.jpg" },
	{ id: 4, name: "Martín Torres", username: "martin.t", avatar: "/avatars/4.jpg" },
  { id: 5, name: "Ana López", username: "ana_l", avatar: "/avatars/5.jpg" },
  { id: 6, name: "Julián Fernández", username: "julianf", avatar: "/avatars/6.jpg" },
	{ id: 4, name: "Martín Torres", username: "martin.t", avatar: "/avatars/4.jpg" },
  { id: 5, name: "Ana López", username: "ana_l", avatar: "/avatars/5.jpg" },
  { id: 6, name: "Julián Fernández", username: "julianf", avatar: "/avatars/6.jpg" },
	{ id: 4, name: "Martín Torres", username: "martin.t", avatar: "/avatars/4.jpg" },
  { id: 5, name: "Ana López", username: "ana_l", avatar: "/avatars/5.jpg" },
  { id: 6, name: "Julián Fernández", username: "julianf", avatar: "/avatars/6.jpg" },
	{ id: 4, name: "Martín Torres", username: "martin.t", avatar: "/avatars/4.jpg" },
  { id: 5, name: "Ana López", username: "ana_l", avatar: "/avatars/5.jpg" },
  { id: 6, name: "Julián Fernández", username: "julianf", avatar: "/avatars/6.jpg" },
];
{/* end test data */}

interface ProfileInteractionsModalProps {
  onClose: () => void;
}

export default function ProfileInteractionsModal ({onClose}: ProfileInteractionsModalProps) {
	const [showLikes, setShowLikes] = useState(true);
	const [showViews, setShowViews] = useState(false);
	const navigate = useNavigate();

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
							{mockLikes.map(user => (
								<div key={user.id} className="flex items-center gap-4 p-2 bg-white rounded-xl shadow-sm">
									<img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
									<div>
										<p className="font-semibold text-pink-700">{user.name}</p>
										<p className="text-sm text-gray-500">@{user.username}</p>
									</div>
									<Button
										onClick={() => navigate(`/profile/${user.id}`)}
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
						<div className="space-y-2 px-6 py-6 bg-pink-200">
							{mockViews.map(user => (
								<div key={user.id} className="flex items-center gap-4 p-2 bg-white rounded-xl shadow-sm">
									<img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
									<div>
										<p className="font-semibold text-pink-700">{user.name}</p>
										<p className="text-sm text-gray-500">@{user.username}</p>
									</div>
									<Button
										onClick={() => navigate(`/profile/${user.id}`)}
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