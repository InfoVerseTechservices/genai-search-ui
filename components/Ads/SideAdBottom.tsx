import { useEffect } from 'react';
import Head from 'next/head';

interface SideBottomAdComponentProps {
  divid: string;
}

const SideBottomAdComponent: React.FC<SideBottomAdComponentProps> = ({ divid }) => {
  useEffect(() => {
    const loadGPTScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load GPT script'));
        document.head.appendChild(script);
      });
    };

    const isSlotDefined = (divid: string): boolean => {
      const slots = window.googletag.pubads().getSlots();
      return slots.some(slot => slot.getSlotElementId() === divid);
    };

    loadGPTScript()
      .then(() => {
        if (window.googletag && window.googletag.cmd) {
          console.log('Initializing Google Publisher Tag...');
          window.googletag.cmd.push(() => {
            try {
              if (!isSlotDefined(divid)) {
                console.log('Defining ad slot...');
                window.googletag.defineSlot(
                  '/23102803892/genai_desktop_300v_sidebar',
                  [[300, 250], [250, 250], [125, 125], [300, 600], [320, 480], [200, 200], [336, 280], [300, 100]],
                  divid
                )?.addService(window.googletag.pubads());

                console.log('Collapsing empty divs...');
                window.googletag.pubads().collapseEmptyDivs();

                console.log('Enabling services...');
                window.googletag.enableServices();

                console.log('Displaying ad...');
                window.googletag.display(divid);
              } else {
                console.log(`Ad slot for div id ${divid} is already defined.`);
              }
            } catch (error) {
              console.error('Error setting up Google Publisher Tag:', error);
            }
          });
        } else {
          console.error('Google Publisher Tag library is not loaded.');
        }
      })
      .catch((error) => {
        console.error('Failed to load Google Publisher Tag script:', error);
      });
  }, [divid]);

  return (
    <>
      <Head>
        <script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
      </Head>
      <div id={divid} style={{ width: '100%', height: '100%' }}></div>
    </>
  );
};

export default SideBottomAdComponent;
