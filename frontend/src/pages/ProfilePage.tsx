import { Button } from "../components/Button";
import MainLayout from "../layouts/MainLayout";

export default function ProfilePage() {
  return (
    <MainLayout>
        {/* Profile Pic */}
        <img src="vite.svg" className="w-50 bg-pink-300 rounded-full"/>
        <h1 className="text-4xl  mt-3 font-semibold">Name</h1>
        <h2 className="text-xl font-semibold my-3">Age</h2>
        <text className="text-xl mb-4">This is my short bio</text>
        {/* Tags List */}
        <div className="flex flex-wrap gap-3">
          <label className="bg-pink-600 rounded-3xl px-2 pb-1 text-white">#tag</label>
          <label className="bg-pink-600 rounded-3xl px-2 pb-1 text-white">#tag</label>
          <label className="bg-pink-600 rounded-3xl px-2 pb-1 text-white">#tag</label>
          <label className="bg-pink-600 rounded-3xl px-2 pb-1 text-white">#tag</label>
        </div>
        {/* User Images List */}
        <div className="flex flex-wrap gap-3 items-center justify-center my-5">
          <img src="vite.svg" className="w-50 h-50 bg-pink-300 rounded-md"></img>
          <img src="vite.svg" className="w-50 bg-pink-300 rounded-md"></img>
          <img src="vite.svg" className="w-50 bg-pink-300 rounded-md"></img>
          <img src="vite.svg" className="w-50 bg-pink-300 rounded-md"></img>
        </div>
        <Button>Edit Profile</Button>
    </MainLayout>
  );
}