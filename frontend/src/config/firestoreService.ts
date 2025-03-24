import { db, auth} from "./config";
import { collection, addDoc, getDocs, Timestamp} from "firebase/firestore";

//firestore data (need to add for the tags feature as well later)
export interface TextEntry{
    id?: string;
    text: string;
    link: string;
    timestamp?: Timestamp;
}

//function to add text and links for the loggged in user
export const addTextAndLink = async (text: string, link: string) : Promise<void> => {
    const user = auth.currentUser;

    if(!user){
        console.log("No authentication found");
        return;
    }
    try{
        await addDoc(collection(db, `users/${user.uid}/text`), {
            text,
            link,
            timestamp: Timestamp.now()
        });

        console.log("Document successfully added for user: ", user.uid);
    }catch(error){
        console.log("Error adding document: ", error);
    }
};

//function to fetch all the texts and links for the logged-in user
export const getTextAndLinks = async (): Promise<TextEntry[]> => {
    const user = auth.currentUser;

    if(!user){
        console.log("No authentication found");
        return [];
    }
    try{
        const querySnapShot = await getDocs(collection(db, `users/${user.uid}/text`));
        const data: TextEntry[] = querySnapShot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        })) as TextEntry[];

        return data;
    }catch(error){
        console.error("Error fetching documents: ", error);
        return [];
    }
};