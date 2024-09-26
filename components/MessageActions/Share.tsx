// import React from 'react';
// import { Mail } from 'lucide-react'; // Assuming you're using lucide icons like in your Rewrite component

// interface ShareProps {
//   message: string;
// }

// // const shareByEmail = (message: string): void => {
// //   const subject = encodeURIComponent('Interesting Article');
// //   const body = encodeURIComponent(message);
// //   window.location.href = `mailto:?subject=${subject}&body=${body}`;
// // }
// const shareByEmail = (message: string): void => {
//   const subject = encodeURIComponent('Interesting Article');
//   const body = encodeURIComponent(message);
//   const mailto = `mailto:?subject=${subject}&body=${body}`;
//   console.log('Share by Email:', mailto); // Check the full mailto link
//   window.location.href = mailto;
// };
// const Share: React.FC<ShareProps> = ({ message }) => {
//   return (
//     <button
//       onClick={() => shareByEmail(message)}
//       className="p-2 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white flex items-center space-x-2"
//       title="Share via Email"
//     >
//       <Mail size={18} /> {/* Icon */}
//       <span className="text-sm">Share</span>
//     </button>
//   );
// };

// export default Share;




import React from 'react';
import { Mail } from 'lucide-react'; // Ensure you have this imported correctly for the icon
import SharePopupComponent from './SharePopup';

interface ShareProps {
  message: string;
}

const shareByEmail = (message: string): void => {
  const subject = encodeURIComponent('Interesting Article');
  const body = encodeURIComponent(message);
  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

  // Dynamically create and click a link element to handle mailto
  const link = document.createElement('a');
  link.href = mailtoLink;
  link.style.display = 'none'; // Do not display the link
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link); // Clean up after clicking
};


const Share: React.FC<ShareProps> = ({ message }) => {
  const [viewPopup,setViewPopup] = React.useState(false)
  const SharePopup = (message : string):void =>{
  
  setViewPopup(!viewPopup)
}
  return (
    <>
    {viewPopup &&
    <SharePopupComponent currentState={viewPopup}/>
}
    <button
      onClick={() => SharePopup(message)}
      className="p-2 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white flex items-center space-x-2"
      title="Share the response"
    >
       {/* Icon */}
      {/* <svg width="18" height="18" viewBox="0 0 28 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.86626 21.84C3.92376 19.6488 9.32501 15 17 15V21L27 11L17 1V7C10.4 7 1.93876 13.3062 1.00001 21.4425C0.987012 21.5479 1.00789 21.6546 1.05961 21.7473C1.11134 21.84 1.19123 21.9139 1.28772 21.9581C1.3842 22.0024 1.49228 22.0148 1.59629 21.9936C1.7003 21.9724 1.79486 21.9186 1.86626 21.84Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

      <span className="text-sm">Share</span> */}
    </button>
    </>
  );
  
};

export default Share;
