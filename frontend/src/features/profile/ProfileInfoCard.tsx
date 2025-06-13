import {Card, CardContent} from "../../components/Card"
import { useProfile } from "./useProfile";

export const ProfileInfoCard = () => {
    const { userProfile } = useProfile();

    if (!userProfile) return <div>Loading...</div>;
    return (
			<Card className="!bg-pink-200 m-3">
				<CardContent>
					<h1 className="text-3xl my-3 mb-6 font-semibold">Personal Information</h1>
					<div className="flex flex-wrap gap-4 justify-center">
						<Card className="!bg-pink-100">
							<CardContent className="!p-4">
								<div className="flex flex-wrap gap-2 justify-center">
									<label className="text-md">Name: </label>
									<label className="text-md">{userProfile.name}</label>
								</div>
							</CardContent>
						</Card>
						<Card className="!bg-pink-100">
							<CardContent className="!p-4">
								<div className="flex flex-wrap gap-2 justify-center">
									<label className="text-md">Last Name: </label>
									<label className="text-md">{userProfile.last_name}</label>
								</div>
							</CardContent>
						</Card>
						<Card className="!bg-pink-100">
							<CardContent className="!p-4">
								<div className="flex flex-wrap gap-2 justify-center">
								<label className="text-md">email: </label>
								<label className="text-md">{userProfile.email} </label>
								</div>
							</CardContent>
						</Card>
						<Card className="!bg-pink-100">
							<CardContent className="!p-4">
								<div className="flex flex-wrap gap-2 justify-center">
									<label className="text-md">username:</label>
									<label className="text-md">{userProfile.username}</label>
								</div>
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>
    );
}