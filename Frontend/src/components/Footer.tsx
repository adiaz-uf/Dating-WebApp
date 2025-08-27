
export const Footer = () => {
    return (
        <footer className="flex justify-around bg-pink-50 shadow-[0_-2px_6px_rgba(0,0,0,0.1)] bottom-0 left-0 w-full z-50 py-1 overflow-hidden">
            <div className="bottom-0 text-center text-gray-500 font-medium text-sm my-4">
                By{' '}
                <a 
                    href="https://profile-v3.intra.42.fr/users/adiaz-uf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800 transition-colors duration-200 underline"
                >
                    adiaz-uf
                </a>
            </div>
            <div className="text-center text-gray-500 font-medium text-sm my-4">
                © 2025 Matcha.
            </div>
        </footer>
    );
}