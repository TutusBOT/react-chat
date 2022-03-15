import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { useState, useRef, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// import ChatRoom from "./components/ChatRoom";
// import SignIn from "./components/SignIn";

firebase.initializeApp({
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: "chat-app-64549.firebaseapp.com",
	projectId: "chat-app-64549",
	storageBucket: "chat-app-64549.appspot.com",
	messagingSenderId: "554642205699",
	appId: "1:554642205699:web:c0c9c8f1758ac021f8b236",
	measurementId: "G-RY8HEMQEEQ",
});
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
	const [user] = useAuthState(auth);
	return (
		<div className="main">
			{user ? <SignOut></SignOut> : ""}
			<section
				className="chat"
				style={user ? { boxShadow: "0 0 1em black" } : { boxShadow: "none" }}
			>
				{user ? <ChatRoom /> : <SignIn />}
			</section>
		</div>
	);
}

function ChatRoom() {
	const messagesRef = firestore.collection("messages");
	const query = messagesRef.orderBy("createdAt").limit(25);
	const [messages] = useCollectionData(query, { idField: "id" });
	const [formValue, setFormValue] = useState("");

	const sendMessage = async (e) => {
		e.preventDefault();
		if (!formValue.trim()) {
			return;
		}
		const { uid, photoURL } = auth.currentUser;

		await messagesRef.add({
			text: formValue,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL,
		});
		setFormValue("");
	};

	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (
		<>
			<div className="messages-list">
				{messages &&
					messages.map((msg, index) => (
						<ChatMessage key={index} message={msg} />
					))}
				<div ref={messagesEndRef}></div>
			</div>
			<form className="message-submitform" onSubmit={sendMessage}>
				<input
					type="text"
					value={formValue}
					onChange={(e) => {
						setFormValue(e.target.value);
					}}
					maxLength="1000"
				/>
				<button type="submit" className="button">
					Send
				</button>
			</form>
		</>
	);
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;
	// console.log(props);
	const messageClass = uid === auth.currentUser.uid ? "sent" : "recieved";
	return (
		<div className={`message-${messageClass}`}>
			<img className="message-img" src={photoURL} alt="users profile" />
			<p>{text}</p>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		if (window.innerWidth > 1400) {
			auth.signInWithPopup(provider);
		} else {
			auth.signInWithRedirect(provider);
		}
	};
	return (
		<button onClick={signInWithGoogle} className="button button-signin">
			Sign In
		</button>
	);
}

function SignOut() {
	return (
		auth.currentUser && (
			<button
				onClick={() => {
					auth.signOut();
				}}
				className="button button-signout"
			>
				Sign Out
			</button>
		)
	);
}

export default App;
