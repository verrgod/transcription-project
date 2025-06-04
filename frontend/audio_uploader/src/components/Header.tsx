import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <nav className="fixed top-0 flex justify-between items-center px-12 w-full p-6 bg-primary text-white">
            <div className="font-sans text-xl font-bold hover:cursor-default">verr</div>
            <div className="flex gap-6">
                <Link to="/" className="font-sans text-xl hover:text-purple-400 transition-colors px-4">Home</Link>
                <Link to="/transcribe" className="font-sans text-xl hover:text-purple-400 transition-colors px-4">Transcribe</Link>
                <Link to="/about" className="font-sans text-xl hover:text-purple-400 transition-colors px-4">About</Link>
            </div>
        </nav>
    );
};

export default Header;
