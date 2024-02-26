import { useState } from "react";
import Siderbar from "../components/Siderbar";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState(0);
  
  return (
    <div className="relative min-h-screen flex flex-row  bg-gray-50 dark:bg-[#17171a] dark:text-red-50  ">
      <Siderbar></Siderbar>
      <div className="flex flex-col overflow-y-auto">
        <div class="flex h-16 w-full flex-shrink-0"> </div>
      </div>

      <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
        <div className="mb-4 h-64 overflow-y-auto">
          {conversations.map((text, index) => (
            <div
              key={index}
              className={`p-2 ${index % 2 === 0 ? "text-left" : "text-right"}`}
            >
              {text}
            </div>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 border-2 border-gray-200 rounded-md"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
export default Chat;
