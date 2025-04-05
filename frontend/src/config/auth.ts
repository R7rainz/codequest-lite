import { 
    createUserWithEmailAndPassword, 
    getAuth, 
    signOut, 
    signInWithPopup, 
    GoogleAuthProvider, 
    GithubAuthProvider, 
    signInWithEmailAndPassword,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
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

//Reset Password
export const sendPasswordResetEmail = async (email: string) => {
  const actionCodeSettings = {
    url: "https://codequest-lite.vercel.app/login", 
    handleCodeInApp: false,
  };

  try {
    await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
    console.log("Password reset email sent");
  } catch (error: any) {
    console.error("Error sending password reset email:", error.code, error.message);
    throw error; 
  }
};
