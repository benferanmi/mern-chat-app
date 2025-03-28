import { useEffect, useRef } from "react"
import { useChatStore } from "../store/useChatStore.js"
import MessageInput from "./MessageInput.jsx"
import ChatHeader from "./ChatHeader.jsx"
import MessageSkeleton from "./skeleton/MessageSkeleton.jsx"
import { useAuthStore } from "../store/useAuthStore.js"
import { formatMessageTime } from "../lib/utils.js"
import { Check, CheckCheck } from "lucide-react"

const ChatContainer = () => {

  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages, displayUserTypingMessage, displayUserStoppedTyping, checkIfMessageIsUpdated } = useChatStore()
  const { authUser } = useAuthStore()
  const messageEndRef = useRef()


  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();
    displayUserTypingMessage();
    checkIfMessageIsUpdated()

    return () => {
      unsubscribeFromMessages();
      displayUserStoppedTyping()
    };

  }, [selectedUser._id, subscribeToMessages, unsubscribeFromMessages, displayUserTypingMessage, getMessages, displayUserStoppedTyping, checkIfMessageIsUpdated]);


  useEffect(() => {

    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const messageStatusIcons = {
    sent: <Check className="rounded-full size-5 text-gray-400 bg-black p-1" />,
    delivered: <CheckCheck className="rounded-full text-gray-400 size-5 bg-black p-1" />,
    seen: <CheckCheck className="rounded-full size-5 p-1 bg-black text-green-500" />,
  };

  if (isMessagesLoading) return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <MessageSkeleton />
      <MessageInput />
    </div>
  )


  return (
    <div className="flex-1 flex flex-col overflow-auto overflow-y-scroll h-[100%]">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div ref={messageEndRef} className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`} key={message._id}>

            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"} alt="profile pic" />
              </div>
            </div>

            <div className="chat-header mb-1 ">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col relative">
              {message.image && (
                <img src={message.image} alt="message image" className="sm:max-w-[200px] rounded-md mb-2" />
              )}

              {message.text && <div>
                <p>{message.text}</p>
                {message.senderId === authUser._id && message.read in messageStatusIcons && (
                  <span className="absolute bottom-[-5px] left-[-5px]">
                    {messageStatusIcons[message.read]}
                  </span>
                )}
              </div>}
            </div>

          </div>
        ))}
      </div>


      <MessageInput />
    </div>
  )
}

export default ChatContainer