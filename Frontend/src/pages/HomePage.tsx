import MainLayout from "../layouts/MainLayout";

export default function HomePage() {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-pink-50\">
        <h1 className="text-4xl font-semibold text-pink-600\">Welcome to Matcha ❤️</h1>
        {/* <MyChat></MyChat> */}
      </div>
    </MainLayout>
  );
}