'use client';

import DeleteChat from '@/components/DeleteChat';
import { formatTimeDifference } from '@/lib/utils';
import {
  BookOpenText,
  ClockIcon,
  Delete,
  ScanEye,
  TrashIcon,
} from 'lucide-react';
import Link from 'next/link';
import { getCookie } from '@/components/LeftSidebar/cookies';
import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from 'react';

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  focusMode: string;
}

export interface ChatGroup {
  groupDate: Date;
  chatGroup: Chat[];
}

const Page = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  // const [chatGroups, setChatGroups] = useState<Record<string, Chat[]>>({});
  const [sortedChatGroups, setSortedChatGroups] = useState<ChatGroup[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteAllDialog, setDeleteAllDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Chat[]>([]);
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = event.target;
    if (checked) {
      setSelectedChats([...selectedChats, value]);
    } else {
      setSelectedChats(selectedChats.filter((id) => id !== value));
    }
  };

  const handleDelete = async () => {
    if (selectedGroup.length === 0) {
      setLoading(true);
      try {
        const idsToDelete = chats.map((group) => group.id);
        console.log('deleting these ids ', idsToDelete);
        for (const id of idsToDelete) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/chats/${id}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token'),
              },
            },
          );
          if (res.status != 200) {
            throw new Error('Failed to delete chat');
          }
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setChats([]);
        console.log('done');
        setLoading(false);
        setDeleteAllDialog(false);
        setSelectedGroup([]);
      }
    } else {
      setLoading(true);
      try {
        const idsToDelete = selectedGroup.map((group) => group.id);
        for (const id of idsToDelete) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/chats/${id}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token'),
              },
            },
          );
          if (res.status != 200) {
            throw new Error('Failed to delete chat');
          }
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        const newChats = chats.filter(
          (chat) => !selectedGroup.some((group) => group.id === chat.id),
        );
        setChats(newChats);
        setDeleteDialog(false);
        setSelectedGroup([]);
        setLoading(false);
      }
    }
  };

  const handleDeleteAll = () => {
    setDeleteAllDialog(true);
  };

  const handleDeleteToggle = (chatGroup: Chat[]) => {
    setDeleteDialog(true);
    const hasSelectedChats = chatGroup.some((chat) =>
      selectedChats.includes(chat.id),
    );

    if (hasSelectedChats) {
      const updatedChatGroup = chatGroup.filter((chat) =>
        selectedChats.includes(chat.id),
      );

      setSelectedGroup(updatedChatGroup);
    }
  };
  const handleCloseDeleteToggle = () => {
    setDeleteDialog(false);
    setDeleteAllDialog(false);
  };

  const formatDate = (date: Date): string => {
    const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const daySuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th'; // catch 11th, 12th, 13th
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };
    return `${dayOfWeek} - ${day}${daySuffix(day)} ${month} ${year}`;
  };

  // const groupChatsByDate = (chats: Chat[]) => {
  //   const groupedChats: Record<string, Chat[]> = {};
  //   for (const chat of chats) {
  //     const chatDate = formatDate(new Date(chat.createdAt));

  //     if (!groupedChats[chatDate]) {
  //       groupedChats[chatDate] = [];
  //     }
  //     groupedChats[chatDate].push(chat);
  //   }

  //   // console.log(groupedChats);

  //   let sortedGroups: ChatGroup[] = [];

  //   Object.keys(groupedChats)
  //     .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  //     .forEach((dateStr) => {
  //       sortedGroups.push({
  //         groupDate: new Date(dateStr),
  //         chatGroup: groupedChats[dateStr],
  //       });
  //     });

  //   console.log(sortedChatGroups);

  //   // setChatGroups(groupedChats);
  //   setSortedChatGroups(sortedGroups);
  // };

  const groupChatsByDate = (chats: Chat[]) => {
    const sortedGroups: ChatGroup[] = chats
      .map((chat) => ({
        groupDate: new Date(chat.createdAt),
        chatGroup: [chat],
      }))
      .reduce((acc: ChatGroup[], current: ChatGroup) => {
        const existingGroup = acc.find(
          (group) =>
            group.groupDate.toDateString() === current.groupDate.toDateString(),
        );
        if (existingGroup) {
          existingGroup.chatGroup.push(current.chatGroup[0]);
        } else {
          acc.push(current);
        }
        return acc;
      }, [] as ChatGroup[])
      .sort((a, b) => b.groupDate.getTime() - a.groupDate.getTime());

    setSortedChatGroups(sortedGroups);
  };

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getCookie('token'),
        },
      });

      const data = await res.json();

      setChats(data.chats);
      setLoading(false);
    };

    fetchChats();
  }, []);

  useEffect(() => {
    groupChatsByDate(chats);
  }, [chats]);

  return loading ? (
    <div className="flex flex-row items-center justify-center min-h-screen border ">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-light-200 fill-light-secondary dark:text-[#202020] animate-spin dark:fill-[#ffffff3b]"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100.003 78.2051 78.1951 100.003 50.5908 100C22.9765 99.9972 0.997224 78.018 1 50.4037C1.00281 22.7993 22.8108 0.997224 50.4251 1C78.0395 1.00281 100.018 22.8108 100 50.4251ZM9.08164 50.594C9.06312 73.3997 27.7909 92.1272 50.5966 92.1457C73.4023 92.1642 92.1298 73.4365 92.1483 50.6308C92.1669 27.8251 73.4392 9.0973 50.6335 9.07878C27.8278 9.06026 9.10003 27.787 9.08164 50.594Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4037 97.8624 35.9116 96.9801 33.5533C95.1945 28.8227 92.871 24.3692 90.0681 20.348C85.6237 14.1775 79.4473 9.36872 72.0454 6.45794C64.6435 3.54717 56.3134 2.65431 48.3133 3.89319C45.869 4.27179 44.3768 6.77534 45.014 9.20079C45.6512 11.6262 48.1343 13.0956 50.5786 12.717C56.5073 11.8281 62.5542 12.5399 68.0406 14.7911C73.527 17.0422 78.2187 20.7487 81.5841 25.4923C83.7976 28.5886 85.4467 32.059 86.4416 35.7474C87.1273 38.1189 89.5423 39.6781 91.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  ) : (
    <>
      <div className="flex justify-between items-center  my-4 mt-12 ">
        <p className=" text-center flex-grow font-[700] text-[21px] text-[#333333]">
          GenAI Search History
        </p>
        <p className="cursor-pointer  " onClick={handleDeleteAll}>
          <TrashIcon size={20} color={deleteAllDialog ? '#E95050' : 'black'} />
        </p>
      </div>

      {deleteDialog && (
        <div className="fixed top-0 left-0 w-full h-full  flex justify-center items-center">
          <div
            className="bg-white   lg:ml-0 ml-16
      p-4 rounded-[20px] border-[1.5px] w-[200px] h-[180px] xl:w-[387.97px] sm:w-[387.97px] sm:h-[264px] xl:h-[264px] md:w-[387.97px] md:h-[264px] lg:w-[387.97px] lg:h-[264px] border-[#EEEEEE] shadow-md  "
          >
            <p className="text-center text-[10px] lg:text-[20px] xl:text-[20px] md:text-[20px] sm:text-[20px] text-[#515151] font-[450] mb-4 mt-6">
              Are you sure you want to delete your selected search history?
            </p>
            <div className="flex items-center justify-center ">
              <button
                className="lg:w-[275.48px] xl:w-[275.48px] md:w-[275.48px] sm:w-[275.48px] w-[100px] bg-[#E95050] rounded-[100px] text-white text-[10px] lg:text-[16px] md:text-[16px] xl:text-[16px] sm:text-[16px] h-[25px] lg:h-[41.32px] md:h-[41.32px] xl:h-[41.32px] sm:h-[41.32px] flex items-center font-[500] justify-center"
                onClick={() => handleDelete()}
              >
                DELETE
              </button>
            </div>
            <div className="flex items-center justify-center mt-4">
              <button
                className="lg:w-[275.48px] xl:w-[275.48px] md:w-[275.48px] sm:w-[275.48px] w-[100px] bg-[#D1D1D1] rounded-[100px] text-[#333333] font-[500] text-[10px] lg:text-[16px] md:text-[16px] sm:text-[16px] xl:text-[16px] h-[25px] lg:h-[41.32px] md:h-[41.32px] sm:h-[41.32px] xl:h-[41.32px] flex items-center justify-center"
                onClick={() => handleCloseDeleteToggle()}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteAllDialog && (
        <div className="fixed  top-0 left-0 w-full h-full  flex justify-center items-center">
          <div
            className="bg-white   lg:ml-0 ml-16
      p-4 rounded-[20px] border-[1.5px] w-[200px] h-[180px] xl:w-[387.97px] sm:w-[387.97px] sm:h-[264px] xl:h-[264px] md:w-[387.97px] md:h-[264px] lg:w-[387.97px] lg:h-[264px] border-[#EEEEEE] shadow-md  "
          >
            <p className="text-center text-[10px] lg:text-[20px] xl:text-[20px] md:text-[20px] sm:text-[20px] text-[#515151] font-[450] mb-4 mt-6">
              Are you sure you want to Clear your selected search history?
            </p>
            <div className="flex items-center justify-center ">
              <button
                className="lg:w-[275.48px] xl:w-[275.48px] md:w-[275.48px] sm:w-[275.48px] w-[100px] bg-[#E95050] rounded-[100px] text-white text-[10px] lg:text-[16px] md:text-[16px] xl:text-[16px] sm:text-[16px] h-[25px] lg:h-[41.32px] md:h-[41.32px] xl:h-[41.32px] sm:h-[41.32px] flex items-center font-[500] justify-center"
                onClick={() => handleDelete()}
              >
                CLEAR ALL
              </button>
            </div>
            <div className="flex items-center justify-center mt-4">
              <button
                className="lg:w-[275.48px] xl:w-[275.48px] md:w-[275.48px] sm:w-[275.48px] w-[100px] bg-[#D1D1D1] rounded-[100px] text-[#333333] font-[500] text-[10px] lg:text-[16px] md:text-[16px] sm:text-[16px] xl:text-[16px] h-[25px] lg:h-[41.32px] md:h-[41.32px] sm:h-[41.32px] xl:h-[41.32px] flex items-center justify-center"
                onClick={() => handleCloseDeleteToggle()}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-hidden">
        {chats.length === 0 && (
          <div className="flex  items-center justify-center h-[70vh] ">
            <div className="text-center   text-[#515151]  text-[18px] font-[450]   w-[477px]">
              Looks like your GenAI search history is as clean as a whistle!
              Keep browsing and let us know if you need any help finding what
              you&apos;re looking for.
            </div>
          </div>
        )}
        {chats.length > 0 && (
          <div className="flex justify-center w-full">
            <div className="w-full justify-center flex flex-col items-center md:mx-20">
              {/* {Object.entries(chatGroups).map(([date, chatGroup]) => { */}
              {sortedChatGroups.map((obj) => {
                const date = obj.groupDate;
                const chatGroup = obj.chatGroup;
                return (
                  <div
                    key={date.toString()}
                    className="bg-[#F7F7F7] overflow-hidden mb-4 border w-full border-[#ACACAC] rounded-lg p-4"
                  >
                    <div className="flex justify-between">
                      <p className="text-center flex-grow text-wrap text-[9px] lg:text-[14px] xl:text-[14px] md:text-[14px] sm:text-[14px] font-[450] text-[#8B8B8B]">
                        {/* {date} */}
                        {date.toLocaleDateString('en-GB', {
                          weekday: 'long', // full weekday name
                          day: 'numeric', // day of the month
                          month: 'long', // full month name
                          year: 'numeric', // full year
                        })}
                      </p>
                      <div className="text-right w-[42px]">
                        {chatGroup.some((chat) =>
                          selectedChats.includes(chat.id),
                        ) && (
                          <p
                            className="text-[#E95050] text-[9px] lg:text-[14px] xl:text-[14px] md:text-[14px] sm:text-[14px] cursor-pointer"
                            onClick={() => handleDeleteToggle(chatGroup)}
                          >
                            Delete
                          </p>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-2 mt-4  lg:ml-0 xl:ml-0 ">
                      {chatGroup.map((chat, i) => (
                        <li key={chat.id} className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-4"
                            checked={selectedChats.includes(chat.id)}
                            onChange={handleCheckboxChange}
                            value={chat.id}
                          />
                          <Link href={`/library/c/${chat.id}`}>
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis text-wrap lg:text-xl font-[18px]   cursor-pointer text-[#515151]">
                              {chat.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
