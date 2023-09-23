import Chat from "./components/Chat";
import LoginForm from "./components/LoginForm";
import { AuthContext } from "./authContext";
import { useState } from "react";

function App() {
  const [currentUser, setCurrentUser] = useState({});

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      <LoginForm></LoginForm>
      <Chat></Chat>
    </AuthContext.Provider>
  );
}

export default App;
