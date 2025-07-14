import React, { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { EmailIcon, FacebookIcon, LinkedinIcon, MessengerIcon, PinterestIcon, RedditIcon, SendIconCopy, SMSIcon, TelegramIcon, TumblrIcon, WhatsAppIcon, XIcon } from '../Icons';

interface ShareProps {
  message: string;
  chatId: string;
  messageId: string;
}

const Share: React.FC<ShareProps> = ({ message, chatId, messageId }) => {
  const [viewPopup, setViewPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shareId, setShareId] = useState('');

  useEffect(() => {
    const fetchShareId = async () => {
      if (!viewPopup) return;
      
      setLoading(true);
      try {
        const res = await fetch('/api/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: chatId,
            messageId: messageId,
            content: message
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setShareId(data.sharedId || data.shareId || data.id);
        } else {
          console.error('Share API failed:', res.status);
        }
      } catch (error) {
        console.error('Share error:', error);
      }
      setLoading(false);
    };

    fetchShareId();
  }, [viewPopup, chatId, messageId, message]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <>
      {viewPopup && (
        <div className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center bg-gray-600 bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-[20px] h-[440px] w-[430px] border border-white">
            <div className="mt-[9px] flex justify-between mx-4">
              <div className="mt-[9px] text-[18px] font-semibold text-black dark:text-white">
                Share Post
              </div>
              <div className="cursor-pointer font-semibold mt-[9px] text-[18px] mr-2 text-black dark:text-white" onClick={() => setViewPopup(false)}>
                ×
              </div>
            </div>

            <hr className="mt-[17px] mb-[19px] mx-4" />
            <div className="mt-4 mb-[19px] flex flex-wrap justify-between mx-auto items-center w-[390px] h-[175px] rounded-xl bg-slate-100 dark:bg-gray-700 p-4">
              <div className="w-[56px] h-[74px] text-[10px] mb-[9px]">
                <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                  <MessengerIcon w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">Messenger</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px] mb-[9px]">
                <div className="bg-[#4676ED] h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                  <FacebookIcon w={30} h={30} fill="white" />
                </div>
                <div className="flex justify-center text-black dark:text-white">Facebook</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px] mb-[9px]">
                <div className="h-[45px] w-[45px] rounded-[50%] flex items-center justify-center" style={{ background: 'linear-gradient(0deg, #78CD51 7.27%, #A0FC84 107.27%)' }}>
                  <WhatsAppIcon w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">WhatsApp</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px] mb-[9px]">
                <div className="bg-black dark:bg-white h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                  <XIcon w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">X</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px] mb-[9px]">
                <div className="bg-[#DC4711] h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                  <RedditIcon w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">Reddit</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px]">
                <div className="bg-[#4467AD] h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                  <LinkedinIcon w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">Linkedin</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px]">
                <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                  <PinterestIcon h={30} w={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">Pinterest</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px]">
                <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex items-center justify-center" style={{ background: 'linear-gradient(0deg, #1D93D2 0%, #38B0E3 100%)' }}>
                  <TelegramIcon w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">Telegram</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px]">
                <div className="bg-[#121F37] h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                  <TumblrIcon w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">Tumblr</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px]">
                <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                  <EmailIcon w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">E-mail</div>
              </div>
              <div className="w-[56px] h-[74px] text-[10px]">
                <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                  <SMSIcon w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">SMS</div>
              </div>
              <div className="w-[56px] h-[76px] text-[10px]">
                <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                  <SendIconCopy w={30} h={30} />
                </div>
                <div className="flex justify-center text-black dark:text-white">Send to</div>
              </div>
            </div>

            <hr className="mx-4" />
            <div className="flex justify-between mt-[14px] w-[400px] h-[60px] mx-auto bg-slate-100 dark:bg-gray-700 rounded-xl p-2 items-center">
              <button className="w-[78%] bg-transparent text-[#1E71F2] text-[12px] rounded-2xl min-w-[314px] h-[30px]" onClick={() => copyToClipboard(`${window.location.origin}/shared/${shareId}`)}>
                {loading ? 'Generating...' : `${window.location.origin}/shared/${shareId}`}
              </button>
              <button onClick={() => copyToClipboard(`${window.location.origin}/shared/${shareId}`)} className="w-[20%] bg-[#1E71F2] text-[14px] text-[white] rounded-2xl w-[80px] h-[30px]" disabled={loading}>
                {loading ? '...' : 'Copy'}
              </button>
            </div>

            <hr className="mx-4 mt-4" />
            <div className="flex justify-center mt-[14px] w-[400px] h-[30px] mx-auto">
              <button className="w-[78%] bg-[#1E71F2] text-[white] text-[12px] rounded-2xl w-[314px] h-[30px]" onClick={() => copyToClipboard(`${window.location.origin}/shared/${shareId}`)} disabled={loading}>
                {loading ? 'Generating Share Link...' : 'Share Link'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setViewPopup(true)}
        className="py-2 px-3 rounded-xl hover:bg-light-secondary hover:text-black dark:hover:bg-dark-secondary transition duration-200 text-black dark:text-white flex flex-row items-center space-x-1"
        title="Share the response"
      >
        <Share2 size={18} />
        <span className="text-sm font-medium">Share</span>
      </button>
    </>
  );
};

export default Share;