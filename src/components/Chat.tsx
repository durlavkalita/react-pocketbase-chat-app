import { SetStateAction, useState, useContext, useEffect } from "react";
import { AuthContext } from "../authContext";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

function Chat() {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const getAllMessages = async () => {
      try {
        const allMessages = await pb.collection("messages").getList(1, 50, {
          sort: "created",
          expand: "user",
        });

        setMessages(allMessages.items);

        let unsubscribe: () => void;
        unsubscribe = await pb
          .collection("messages")
          .subscribe("*", async ({ action, record }) => {
            if (action === "create") {
              // Fetch associated user
              const user = await pb.collection("users").getOne(record.user);
              record.expand = { user };
              setMessages([...messages, record]);
            }
            // if (action === 'delete') {
            //   messages = messages.filter((m) => m.id !== record.id);
            // }
          });
      } catch (error) {
        console.log(error);
      }
    };

    getAllMessages();
    return function () {
      controller.abort();
    };
  }, [messages]);

  const handleInputChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      const data = {
        content: newMessage,
        user: currentUser.user.record.id,
      };
      const createdMessage = await pb.collection("messages").create(data);
      console.log(messages);
      console.log(createdMessage);
      const allMessages = [...messages, createdMessage];
      setMessages(allMessages);
      setNewMessage("");
    }
  };
  if (!currentUser.user) {
    return "";
  } else {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col justify-between">
        <div className="p-4">
          <div className="max-h-60 overflow-y-scroll">
            {messages.map((message) => (
              <div key={message.id} className="mb-2">
                {message.user} - {message.content}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 flex items-center">
          <input
            className="flex-grow rounded-l-lg border-t mr-2 py-2 px-4 focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleInputChange}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg focus:outline-none focus:shadow-outline"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    );
  }
}

export default Chat;
