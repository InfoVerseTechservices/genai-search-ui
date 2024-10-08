import React from "react";
import { EmailIcon, FacebookIcon, InstagramIcon, LinkedinIcon, MessengerIcon, PinterestIcon, RedditIcon, SendIconCopy, SMSIcon, TelegramIcon, TumblrIcon, WhatsAppIcon, XIcon } from "../Icons";
interface SharePopupComponent {
    currentState: boolean;
  }
  
  export default function SharePopupComponent({ currentState }: SharePopupComponent) {
    const [isVisible, setIsVisible] = React.useState<boolean>(currentState);
  
    const handleVisibility = () => {
      setIsVisible(!isVisible);
    };
    React.useEffect(()=>{
      
    },[isVisible])
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log("Text copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    };
  
    return (
      <>
        {isVisible && (
           <div className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center bg-gray-600 bg-opacity-50 ">
           <div className="bg-[white]    
  rounded-[20px] h-[440px] w-[430px]  border border-white ">
             
             <div className="mt-[9px] flex justify-between mx-4">
              
               <div className=" mt-[9px] text-[18px] font-semibold" >
                 Share Post

               </div>
               <div className="cursor-pointer font-semibold mt-[9px] text-[18px] mr-2" onClick={()=>handleVisibility()}>
                x
               </div>

             </div>
             
             
             <hr className="mt-[17px] mb-[19px] mx-4"/>
             <div className="mt-4 mb-[19px]  flex flex-wrap justify-between mx-auto items-center w-[390px] h-[175px] rounded-xl bg-slate-100 p-4"> 
 
            
                 <div className="w-[56px] h-[74px] text-[10px] mb-[9px]">
                 <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                   {/* <MessengerIcon/> */}
                   <MessengerIcon w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 Messenger
                 </div>
                 </div>
                 <div className="w-[56px] h-[74px] text-[10px] mb-[9px]">
                 <div className="bg-[#4676ED] h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                 {/* <FacebookIcon w={23.96} h={45.06} fill="white"/> */}
                 <FacebookIcon w={30} h={30} fill="white"/>
                 </div>
                 <div className="flex justify-center">
                  Facebook
                 </div>
                 </div>
                 <div className="w-[56px] h-[74px] text-[10px] mb-[9px]">
                 <div className="h-[45px] w-[45px] rounded-[50%] flex items-center justify-center" style={{ background: 'linear-gradient(0deg, #78CD51 7.27%, #A0FC84 107.27%)' }}>
                   {/* <WhatsAppIcon/> */}
                   <WhatsAppIcon w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 WhatsApp
                 </div>
                 </div>
                 <div className="w-[56px] h-[74px] text-[10px] mb-[9px]">
                 <div className="bg-black h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                   {/* <XIcon/> */}
                   <XIcon w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 X
                 </div>
                 </div>
                 <div className="w-[56px] h-[74px] text-[10px] mb-[9px]" >
                 <div className="bg-[#DC4711] h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                   {/* <RedditIcon/> */}
                   <RedditIcon w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 Reddit
                 </div>
                 </div>
                 <div className="w-[56px] h-[74px] text-[10px]">
                 <div className="bg-[#4467AD] h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                   {/* <LinkedinIcon/> */}
                   <LinkedinIcon w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 Linkedin
                 </div>
                 </div>
                 <div className="w-[56px] h-[74px] text-[10px]">
                 <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex justify-center items-center">
                   {/* <PinterestIcon/> */}
                   <PinterestIcon h={30} w={30}/>
                 </div>
                 <div className="flex justify-center">
                 Pinterest
                 </div>
                 </div>
                 <div className="w-[56px] h-[74px] text-[10px]">
                 <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex items-center justify-center" style={{background: `linear-gradient(0deg, #1D93D2 0%, #38B0E3 100%)`
 }}>
                   {/* <TelegramIcon/> */}
                   <TelegramIcon w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 Telegram
                 </div>
                 </div>
                 <div className="w-[56px] h-[74px] text-[10px]">
                 <div className="bg-[#121F37] h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                   {/* <TumblrIcon/> */}
                   <TumblrIcon w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 Tumblr
                 </div>
                 </div>
                 
                 <div className="w-[56px] h-[74px] text-[10px]">
                 <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                 {/* <EmailIcon/> */}
                 <EmailIcon w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 E-mail
                 </div>
                 </div>
                 <div className="w-[56px] h-[74px] text-[10px]">
                 <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                 {/* <SMSIcon/> */}
                 <SMSIcon w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 SMS
                 </div>
                 </div>
                 <div className="w-[56px] h-[76px] text-[10px]">
                 <div className="bg-white h-[45px] w-[45px] rounded-[50%] flex items-center justify-center">
                  {/* <SendIconCopy /> */}
                  <SendIconCopy w={30} h={30}/>
                 </div>
                 <div className="flex justify-center">
                 Send to
                 </div>
                 </div>
             </div>
             
             <hr className="mx-4"/>
            <div className="flex justify-between mt-[14px] w-[400px] h-[60px] mx-auto bg-slate-100 rounded-xl p-2 items-center">
              <button className="w-[78%] bg-transparent text-[#1E71F2] text-[12px] rounded-2xl min-w-[314px] h-[30px]" onClick={() => copyToClipboard('https://post.colomboai.com/660ad7b3053e33a40c....')}>
              https://post.colomboai.com/660ad7b3053e33a40c....
              
              </button>
              <button onClick={() => copyToClipboard('https://post.colomboai.com/660ad7b3053e33a40c....')} className="w-[20%] bg-[#1E71F2] text-[14px] text-[white] rounded-2xl w-[80px] h-[30px]">
                Copy
                </button>
            </div>
            <hr className="mx-4 mt-4"/>
            <div className="flex justify-center  mt-[14px] w-[400px] h-[30px] mx-auto">
              <button className="w-[78%] bg-[#1E71F2] text-[white] text-[12px] rounded-2xl w-[314px] h-[30px]" onClick={() => copyToClipboard('https://post.colomboai.com/660ad7b3053e33a40c....')}>
                Share on Feed
              
              </button>
              
            </div>
               
           </div>
         </div>
        )}
        </>
    )
  }