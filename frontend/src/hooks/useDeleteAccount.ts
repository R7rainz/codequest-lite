import { getAuth, deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const useDeleteAccount = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const deleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("No user logged in!");
      return;
    }

    if (!window.confirm("⚠️ Are you sure you want to delete your account?")) {
      return;
    }

    try {
      await deleteUser(user);
      alert("✅ Account deleted.");
      navigate("/");
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        alert("⚠️ Please log out and log in again.");
      } else {
        console.error("Error:", error);
        alert("❌ Failed to delete account.");
      }
    }
  };

  return deleteAccount;
};
