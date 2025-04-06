import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {User} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // start with true to wait for auth check

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // done loading
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
