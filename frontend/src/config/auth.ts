import { 
    createUserWithEmailAndPassword, 
    getAuth, 
    signOut, 
    signInWithPopup, 
    GoogleAuthProvider, 
    GithubAuthProvider, 
    signInWithEmailAndPassword 
} from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// function for signup with email and password
export const signUp = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

// function for login with email and password
export const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// function for login with Google
export const loginWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
}

// function for login with GitHub
export const loginWithGithub = async () => {
    return signInWithPopup(auth, githubProvider);
}

// function to logout
export const logout = async () => {
    return signOut(auth);
}