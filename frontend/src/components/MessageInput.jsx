import React, { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { X, Send, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageInput = () => {

    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(false);
    const fileInputRef = useRef(null);
    const { sendMessages, isUserTypingMessage, isUserStoppedTyping, setTyping, isTyping, } = useChatStore()
    let typingTimeout;


    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file.type.startsWith("image/")) {
            toast.error("Please Select an Image file");
            return;
        }

        setImagePreview(file)
    };

    const removeImage = () => {
        setImagePreview(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }


    //Todo: Adjust the user is typing feature so that the behaviour of the user is typing will be smooth when a messaging user is typing. 
    const handleTextChange = async (e) => {
        setText(e.target.value);

        if (!isTyping) {
            setTyping(true)
            isUserTypingMessage()
        }

        clearTimeout(typingTimeout)

        typingTimeout = setTimeout(() => {
            setTyping(false)
            isUserStoppedTyping()
        }, 5000)

    }


    const handleSendMessage = async (e) => {
        e.preventDefault();

        const formdata = new FormData()

        formdata.append('image', imagePreview)
        formdata.append('text', text)

        try {
            await sendMessages(formdata)

            //clear form 
            setText("")
            setImagePreview(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
        } catch (error) {
            console.error("Failed to send message:", error)
        }
    }

    return (
        <div className='p-4 w-full'>
            {
                imagePreview && (
                    <div className='mb-3- flex items-center gap-2'>
                        <div className='relative'>
                            <img src={imagePreview ? URL.createObjectURL(imagePreview) : ""} alt='preview' className='w-20 h-20 object-contain rounded-lg border border-zinc-700' />
                            <button className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center'
                                onClick={removeImage}>
                                <X className='size-3' />
                            </button>
                        </div>
                    </div>
                )
            }

            <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
                <div className='flex-1 flex gap-2'>
                    <input type='text' className='w-full input input-bordered rounded-lg input-sm sm:input-md ' placeholder='Type a message....' value={text} onChange={handleTextChange} />

                    <input type="file" accept="/image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                    <button type="button" className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-400"} `} onClick={() => fileInputRef.current?.click()} >
                        <Image size={20} />
                    </button>
                </div>

                <button type="submit" className="btn btn-sm btn-circle" disabled={!text.trim() && !imagePreview}>
                    <Send size={22} />
                </button>
            </form>
        </div>
    )
}

export default MessageInput