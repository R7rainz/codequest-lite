import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import {User} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const auth = getAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if(currentUser){
                navigate("/dashboard");
            }
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    if(loading) return <p>Loading...</p>;

    //prevents the route from redirecting to "/" before Firebase finishes checking authentication
    if (user === null) {
        return <p>Loading...</p>;
    }

    return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
