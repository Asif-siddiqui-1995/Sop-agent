import {NavLink} from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">Employee SOP Q&A Chatbot</div>

            <ul className="nav-links">
                <li>
                    <NavLink
                        to="/"
                        className={({isActive}) => (isActive ? "active" : "")}
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/upload"
                        className={({isActive}) => (isActive ? "active" : "")}
                    >
                        Upload SOPs
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/dashboard"
                        className={({isActive}) => (isActive ? "active" : "")}
                    >
                        Dashboard
                    </NavLink>
                </li>
            </ul>

            <div className="profile">
                <img src="https://i.pravatar.cc/40" alt="user" />
                <span>John Doe</span>
            </div>
        </nav>
    );
}
