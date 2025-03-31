import { useEffect, useRef, useState } from "react"
import { useChatStore } from "../store/useChatStore.js"
import MessageInput from "./MessageInput.jsx"
import ChatHeader from "./ChatHeader.jsx"
import MessageSkeleton from "./skeleton/MessageSkeleton.jsx"
import { useAuthStore } from "../store/useAuthStore.js"
import { formatMessageTime } from "../lib/utils.js"
import { Check, CheckCheck, ChevronDown, X } from "lucide-react"

const ChatContainer = () => {

  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages, displayUserTypingMessage, displayUserStoppedTyping, checkIfMessageIsUpdated, deleteMessage } = useChatStore()
  const { authUser } = useAuthStore()
  const messageEndRef = useRef()
  const [replyMessage, setReplyMessage] = useState(null)
  const [activeMessageId, setActiveMessageId] = useState(null)

  const [startX, setStartX] = useState(0);



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

  const messageStatusIcons = {
    sent: <Check className="rounded-full size-5 text-gray-400 bg-black p-1" />,
    delivered: <CheckCheck className="rounded-full text-gray-400 size-5 bg-black p-1" />,
    seen: <CheckCheck className="rounded-full size-5 p-1 bg-black text-green-500" />,
  };

  const handleReply = (message) => {
    setReplyMessage(message)
    console.log(message)
  }
  
  const handleTouchStart = (e) => {
    // Record the starting position of the touch
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e, message) => {
    // Get the ending position of the touch
    const endX = e.changedTouches[0].clientX;
    const distanceX = endX - startX;

    // Check if the swipe distance is significant (e.g., 50 pixels)
    if (distanceX > 50) {
      handleReply(message);
    }
  };


  const handleActiveMessageCancel = () => {
    setActiveMessageId(null)
    setReplyMessage(null)
  }

  useEffect(() => {

    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    handleActiveMessageCancel()

  }, [messages])


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
        {messages.map((message) => {

          const replyToMessage = message.replyTo ? messages.find((msg) => msg._id === message.replyTo) : null

          return (
            <div
              ref={messageEndRef}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              key={message._id}
              onContextMenu={() => {
                setActiveMessageId((prevId) => prevId === message._id ? null : message._id)
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={() => handleTouchEnd(message)}
            >

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

              <div className="chat-bubble flex flex-col relative pr-6">
                {
                  message.image && (
                    <img src={message.image} alt="message image" className="sm:max-w-[200px] rounded-md mb-2" />
                  )
                }
                <div className="flex  flex-col gap-0">
                  {
                    replyToMessage && <div className="bg-slate-700 p-[2px] px-2 rounded-md text-slate-300" key={`${message._id}-reply`}>{replyToMessage.text}</div>
                  }


                  {
                    message.text && <div className="">
                      <p>{message.text}</p>
                      {message.senderId === authUser._id && message.status in messageStatusIcons && (
                        <span className="absolute bottom-[-5px] left-[-5px]">
                          {messageStatusIcons[message.status]}
                        </span>
                      )}
                    </div>
                  }

                </div>


                <ChevronDown className="absolute size-5 right-[2px] top-[2px] text-white bg-none hidden lg:block" onClick={() => { setActiveMessageId((prevId) => prevId === message._id ? null : message._id) }} />

                {
                  activeMessageId === message._id &&
                  <div className="absolute top-6 z-10 right-[-70px] bg-base-content text-base-100 rounded-xl shadow-sm shadow-slate-50 p-4">
                    <p className="mr-1 mb-1 font-light cursor-pointer ">React</p>
                    <p className="mr-1 mb-1 font-light cursor-pointer" onClick={() => handleReply(message)}>Reply</p>
                    <p className="mr-1 mb-1 font-light cursor-pointer " onClick={() => deleteMessage(message._id)}>Delete</p>

                  </div>

                }
              </div>

            </div>
          )
        }

        )}
      </div>

      <div className="flex flex-col w-full mt-2">
        {
          replyMessage && (
            <div className="w-[95%] m-auto bg-slate-600 py-2 text-[14px] rounded-sm px-2 flex flex-nowrap flex-row gap-3 justify-between" >
              {replyMessage.text}

              <span className="cursor-pointer" onClick={handleActiveMessageCancel}><X /></span>
            </div>
          )
        }
        <MessageInput replyTo={replyMessage ? replyMessage._id : null} />
      </div>
    </div>
  )
}

export default ChatContainer