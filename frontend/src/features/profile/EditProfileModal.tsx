import { useProfile } from "./useProfile";

export default function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { userProfile, updateProfile } = useProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: "Nuevo nombre" }); // TODO: ejemplo
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
        <h2 className="text-xl mb-4">Editar perfil</h2>
        {/* Campos de edición aquí */}
        <button type="submit">Guardar</button>
        <button onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}