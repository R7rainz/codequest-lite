import { Link, NavLink } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-black shadow-md z-50">
      <nav className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img className="mr-3 h-10 rounded-full" alt="logo" />
        </Link>

        {/* Navigation Links */}
        <ul className="flex-1 flex justify-center items-center space-x-4">
          {["Home", "About"].map((text, index) => {
            const path = text === "Home" ? "/" : `/${text.toLowerCase().replace(" ", "")}`;

            return (
              <li key={index}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `block py-2 px-4 transition duration-200 ${
                      isActive
                        ? "underline underline-offset-4 text-black dark:text-white"
                        : "text-black dark:text-white hover:underline hover:underline-offset-4"
                    }`
                  }
                >
                  {text}
                </NavLink>
              </li>
            );
          })}
          </ul>

          <div className="flex items-center space-x-4">
          <Link to="/login" className="text-black dark:text-white hover:underline">
            Log In
          </Link>
          <Link to="/signup" className="text-black dark:text-white hover:underline">
            Sign Up
          </Link>
          <ModeToggle />
        </div>          
      </nav>
    </header>
  );
}
