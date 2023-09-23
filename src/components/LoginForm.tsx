import { SetStateAction, useState, useContext } from "react";
import PocketBase from "pocketbase";
import { AuthContext } from "../authContext";

const pb = new PocketBase("http://127.0.0.1:8090");

function LoginForm() {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    const authData = await pb
      .collection("users")
      .authWithPassword(username, password);
    setCurrentUser({ user: authData });
  };

  const handleSignIn = async () => {
    try {
      const data = {
        username,
        password,
        passwordConfirm: password,
      };
      const createdUser = await pb.collection("users").create(data);
      await handleLogin();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    pb.authStore.clear();
    setCurrentUser({});
  };

  if (currentUser.user) {
    return (
      <div className="py-4 px-4 flex justify-between items-center">
        <p>
          Signed in as{" "}
          <span className="text-blue-700">
            {currentUser.user.record.username}
          </span>
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={handleSignOut}
        >
          Log Out
        </button>
      </div>
    );
  } else {
    return (
      <div className="max-w-md mx-auto mt-4 p-4 border rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleLogin}
            >
              Log In
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleSignIn}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default LoginForm;
