import { useState } from "react"
import {login, loginWithGithub, loginWithGoogle} from "../config/auth"


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleLogin = async(e:React.FormEvent) => {
        e.preventDefault();
        try{
            await login(email, password);
            alert("Logged in successfully");
        }catch (error){
            setError("Failed to log in"+(error as Error).message);
        }
    };

    const handleGoogleLogin = async() => {
        try{
            await loginWithGoogle();
            alert("Logged in successfully");
        }catch (error){
            setError("Failed to log in"+(error as Error).message);
        }
    };

    const handleGithubLogin = async() => {
        try{
            await loginWithGithub();
            alert("Logged in successfully");
        }catch (error){
            setError("Failed to log in"+(error as Error).message);
        }
    };


    return (
        <div className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" value = {email} onChange={(e) => setEmail(e.target.value)}/>
                <input type="password" placeholder="Password" value = {password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
            <button onClick={handleGoogleLogin}>login with google</button>
            <button onClick={handleGithubLogin}>login with github</button>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Login;

