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
  return (
    <button
      onClick={() => shareByEmail(message)}
      className="p-2 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white flex items-center space-x-2"
      title="Share via Email"
    >
      <Mail size={18} /> {/* Icon */}
      <span className="text-sm">Share</span>
    </button>
  );
};

export default Share;
