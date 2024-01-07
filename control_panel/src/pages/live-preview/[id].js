import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import VideoPlayer from "../../../components/live/video_player";
import Cookie from "js-cookie";
import LiveVideoPlayer from "../../../components/live/live_video_player";

export default function LivePreview() {
  const [liveData, setLiveData] = useState();
  const [loading, setLoading] = useState(false);
  const [poll, setPoll] = useState();
  const router = useRouter();
  const { id } = router?.query;
  // chat socket connection
  const [connection, setConnection] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [pollResultBox, setPollResultBox] = useState(false);

  const [message, setMessage] = useState();
  const [userNameSubmitted, setUserNameSubmitted] = useState(false);

  const bottomOfChat = useRef(null);
  const chatContainer = useRef(null);

  const [showChatBar, setShowChatBar] = useState(false);
  const [userNameForLive, setUserNameForLive] = useState();

  const checkScreenSize = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;

    setShowChatBar(!isMobile || (isMobile && isPortrait));
  };

  useEffect(() => {
    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  async function fetch_poll_by_id(id) {
    await axios
      .get(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/get_poll/${id}`)
      .then((res) => {
        setShowResult(false);
        setPoll(res?.data?.results);
        setPollResultBox(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const [pollResult, setPollResult] = useState();
  const [showResult, setShowResult] = useState(false);

  async function fetch_result_by_id(id) {
    setShowResult(false);
    await axios
      .get(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/results/${id}`)
      .then((res) => {
        setPollResult(res?.data);
        setPollResultBox(true);
        setShowResult(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    retrive_live_obj();

    // chat connection
    if (id && userNameForLive) {
      const connection = new WebSocket(
        `${process.env.NEXT_PUBLIC_LIVE_CHAT_URL}/${id}/${stringToHashCode(
          userNameForLive
        )}/`
      );
      connection.onmessage = function (e) {
        const json = JSON.parse(e.data);

        if (json.type === "poll_init") {
          fetch_poll_by_id(json?.data?.poll_id);
        }
        if (json.type === "result_init") {
          fetch_result_by_id(json?.data?.poll_id);
        }

        setChatData((prevData) => {
          const has_any = prevData.find(
            (item) => item?.data?.chat_id === json?.data?.chat_id
          );
          if (has_any) {
            return prevData;
          }
          return [...prevData, json];
        });
      };

      setConnection(connection);
    }
  }, [router?.query, userNameForLive]);

  useEffect(() => {
    if (chatContainer.current && bottomOfChat.current) {
      const scrollHeight = chatContainer.current.scrollHeight;
      const height = chatContainer.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainer.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, [chatData]);

  async function retrive_live_obj() {
    if (id) {
      await axios
        .get(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/retrive_live_by_id/${id}`)
        .then((res) => {
          setLiveData(res?.data?.results);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function getFirstWord(userName) {
    return userName ? userName.charAt(0) : "";
  }

  function generateRandomBrightColor() {
    const r = Math.floor(Math.random() * (255 - 100) + 100);
    const g = Math.floor(Math.random() * (255 - 100) + 100);
    const b = Math.floor(Math.random() * (255 - 100) + 100);

    // Convert to hexadecimal color code
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  const [replyObj, setReplyObj] = useState();

  function select_for_reply(item) {
    setReplyObj(item);
  }

  function cancel_reply() {
    setReplyObj("");
  }

  function sendMessage() {
    if (connection && message.trim().length > 0) {
      let data = {};
      if (!replyObj) {
        data = {
          message: message,
          user_name: userNameForLive ? userNameForLive : "Unknown",
        };
      } else {
        data = {
          message: message,
          user_name: userNameForLive ? userNameForLive : "Unknown",
          reply_for: replyObj?.data?.chat_id,
        };
      }
      const jsonData = JSON.stringify(data);
      connection.send(jsonData);
      setMessage("");
      setReplyObj("");
    }
  }

  function json_to_array(data) {
    const optionArray = Object.entries(data).map(([key, value]) => ({
      id: key,
      value,
    }));

    return optionArray;
  }

  function join() {
    Cookie.set("user_name", userNameForLive);
    setUserNameSubmitted(true);
  }

  useEffect(() => {
    let user_name = router?.query?.user_name;
    if (user_name) {
      setUserNameSubmitted(true);
      setUserNameForLive(user_name);
    }
  }, [router?.query]);

  const [ansSelect, setAnsSelect] = useState();
  const [alreadySelect, setAlreadySelect] = useState(false);

  function stringToHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  async function cast_vote(value) {
    const data = {
      question_id: poll?.id,
      option_choosed: parseInt(value?.poll_obj?.id),
      user_id: stringToHashCode(userNameForLive),
    };

    await axios
      .post(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/cast_vote`, data)
      .then((res) => {
        console.log(res?.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function handleSelectedAns(item, index) {
    if (!alreadySelect) {
      const data = {
        poll_obj: item,
        index: index,
        action: true,
      };
      console.log(data);
      setAnsSelect(data);
      setAlreadySelect(true);
      await cast_vote(data);
    }
  }

  // const [roomInUser, setRoomInUser] = useState(0);

  // async function get_room_in_user() {
  //   await axios
  //     .get(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/room-info/${parseInt(id)}`)
  //     .then((res) => {
  //       setRoomInUser(res?.data?.count);
  //       console.log(res?.data?.count);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* You can add other meta tags and head elements here */}
      </Head>

      <div className="bg-black">
      <div
        className="max-w-6xl mx-auto h-screen  bg-black overflow-y-scroll relative "
        ref={chatContainer}
      >
        {/* {!userNameSubmitted && (
          <div className="h-screen place-items-center fixed flex justify-center top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-100 max-h-full bg-gray-800 bg-opacity-80">
            <div className="bg-white rounded-lg p-4 min-w-max ">
              <h1 className=" text-center font-semibold text-lg">Your name?</h1>
              <input
                value={userNameForLive}
                onChange={(e) => setUserNameForLive(e.target.value)}
                type="text"
                id="first_name"
                className="mt-4 text-sm rounded-lg  block w-full p-2.5 border-2  border-black placeholder-gray-700 focus:ring-blue-500 focus:border-blue-500 "
                required
              />
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => join()}
                  className="bg-blue-600 rounded-lg px-2.5 py-1 text-white hover:bg-blue-800 "
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )} */}
        {userNameSubmitted && (
          <div className="lg:mt-40">
            <div className=" grid grid-cols-1 md:grid-cols-12">
              <div
                className={` ${
                  showChatBar
                    ? " col-span-1 md:col-span-8 "
                    : " col-span-1 md:col-span-12"
                }`}
              >
                <div className="bg-black sticky top-0">
                  <div className="relative rounded-md">
                    {liveData && (
                      <LiveVideoPlayer src={`${process.env.NEXT_PUBLIC_LIVE_STREMING_VIDEO_URL}/${liveData?.live_key}/index.m3u8`} />
                      // <VideoPlayer
                      //   src={`${process.env.NEXT_PUBLIC_LIVE_STREMING_VIDEO_URL}/${liveData?.live_key}/index.m3u8`}
                      // />
                    )}

                    <div className="">
                      {pollResultBox && (
                        <div className="absolute bottom-10  rounded-lg  bg-gray-900 opacity-80  mx-20 lg:mx-36 p-4">
                          {/* poll cross btn */}
                          <div
                            className="absolute top-[-10px] right-[-10px] bg-gray-500 rounded-full opacity-80 w-6 h-6 "
                            onClick={() => setPollResultBox(!pollResultBox)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-6 h-6 text-white"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </div>

                          {/* poll and result box */}

                          {pollResultBox && (
                            <>
                              <div>
                                {poll && (
                                  <>
                                    {showResult && (
                                      <div className="flex items-center justify-center space-x-1 mb-2">
                                        <div>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="w-6 h-6 text-white"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                            />
                                          </svg>
                                        </div>
                                        <div>
                                          <h1 className="text-white font-bold text-">
                                            {pollResult?.total_vote}
                                          </h1>
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      <h1 className="text-center mb-2 text-white font-semibold">
                                        {poll?.question}
                                      </h1>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2  ">
                                      {json_to_array(poll?.option)?.map(
                                        (item, index) => {
                                          const result =
                                            pollResult?.results?.find(
                                              (result) =>
                                                parseInt(
                                                  result.option_choosed
                                                ) === parseInt(item.id)
                                            );
                                          const voteCount = result
                                            ? result.vote_count
                                            : 0;

                                          return (
                                            <div
                                              onClick={() =>
                                                handleSelectedAns(item, index)
                                              }
                                              key={index}
                                              className={`opacity-80 rounded-lg text-center py-2 text-white h-12 p-2 overflow-auto ${
                                                !showChatBar ? "w-[320px]" : "w-[200px]"
                                              } ${
                                                parseInt(ansSelect?.poll_obj?.id) === parseInt(item?.id) &&
                                                parseInt(pollResult?.correct_ans) === parseInt(item?.id)
                                                  ? "bg-green-600"
                                                  : parseInt(ansSelect?.poll_obj?.id) === parseInt(item?.id)
                                                  ? "bg-blue-600"
                                                  : parseInt(pollResult?.correct_ans) === parseInt(item?.id)
                                                  ? "bg-green-600"
                                                  : "bg-gray-700"
                                              }`}

                                            >
                                              {showResult && (
                                                <div className="flex space-x-2">
                                                  <div>{item?.value}</div>
                                                  <div>
                                                    <div className="flex items-center ">
                                                      <div>
                                                        <svg
                                                          xmlns="http://www.w3.org/2000/svg"
                                                          fill="none"
                                                          viewBox="0 0 24 24"
                                                          strokeWidth="1.5"
                                                          stroke="currentColor"
                                                          className="w-4 h-4 text-white"
                                                        >
                                                          <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                                          />
                                                        </svg>
                                                      </div>

                                                      <div>
                                                        <span className="text-white font-bold">
                                                          ({voteCount})
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                              {!showResult && (
                                                <div>{item?.value}</div>
                                              )}
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {showChatBar && (
                <div className="relative col-span-1 md:col-span-4 rounded-r-lg lg:h-[440px] lg:overflow-auto ">
                  <div className="">
                    <div className="bg-black sticky top-0 flex justify-between items-center pb-2 border-b-2 border-gray-700 p-4 opacity-80 ">
                      <div>
                        <h1 className="text-white font-bold text-lg">
                          Live Chat
                        </h1>
                      </div>

                      <div onClick={() => setShowChatBar(!showChatBar)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* chat list */}

                    <div className="">
                      <div className=" ">
                        {chatData && (
                          <>
                            {chatData?.map((item, index) => (
                              <div key={index}>
                                {item?.data?.message !== "POLL" &&
                                  item?.data?.message !== "RESULT" && (
                                    <div className="flex space-x-2 items-center px-4 my-8">
                                      <div className="w-full">
                                        {item?.data?.reply_from && (
                                          <div className="bg-gray-800 text-white rounded-t-lg p-2">
                                            <div className="flex items-center space-x-1">
                                              <div>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  strokeWidth="1.5"
                                                  stroke="currentColor"
                                                  className="w-4 h-4"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25"
                                                  />
                                                </svg>
                                              </div>
                                              <div>
                                                <h1 className="text-white font-xs">
                                                  {item?.data?.reply_from}
                                                </h1>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        <div className="flex space-x-2 items-center ">
                                          <div
                                            className="flex-shrink-0 flex-grow-0 w-8 h-8 rounded-full overflow-hidden bg-indigo-800"
                                            // style={{
                                            //   backgroundColor:
                                            //     generateRandomBrightColor(),
                                            // }}
                                          >
                                            <h1 className="w-full h-full flex items-center justify-center text-center font-bold text-white">
                                              {getFirstWord(
                                                item?.data?.user_name
                                              )}
                                            </h1>
                                          </div>
                                          <div className="flex-grow">
                                            <h1 className="text-gray-500 font-xs">
                                              {item?.data?.user_name}
                                            </h1>
                                            <h1 className="text-white font-xs break-all">
                                              {item?.data?.message}
                                            </h1>
                                          </div>
                                        </div>
                                      </div>

                                      <div
                                        className=""
                                        role="button"
                                        onClick={() => {
                                          select_for_reply(item);
                                        }}
                                        title="reply"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth="1.5"
                                          stroke="currentColor"
                                          className="w-4 h-4 text-white"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                {/* 

           {item?.type === 'poll_init' &&
               <>
                   <h1 className="text-center text-green-300 animate-pulse ">"{selectedQuestion?.question} - poll initiate"</h1>
               </>
           }


           {item?.type === 'result_init' &&
               <>
                   <h1 className="text-center text-green-300 animate-pulse ">"{selectedQuestionForResultPublish?.question} - result published"</h1>
               </>
           } */}
                              </div>
                            ))}
                          </>
                        )}

                        <div className="sticky  bg-gray-700 bottom-0 rounded-b-lg z-[100]  ">
                          {replyObj && (
                            <div className="mt-4">
                              <h1 className="text-white text-sm font-medium px-4 bg-gray-600 mx-4 rounded-lg py-2">
                                Replied for{" "}
                                <span className="italic font-bold text-red-200">
                                  {replyObj?.data?.message}
                                </span>
                                <br />
                                <span
                                  role="button"
                                  onClick={() => cancel_reply()}
                                  className="text-[10px] underline text-green-300 italic "
                                >
                                  cancel
                                </span>
                              </h1>
                            </div>
                          )}

                          <div className="flex py-4 ">
                            <textarea
                              value={message}
                              onKeyDown={(e) =>
                                e.key === "Enter" && sendMessage()
                              }
                              onChange={(e) => setMessage(e?.target?.value)}
                              id="chat"
                              rows="1"
                              className="block mx-4 p-2.5 w-full text-sm   rounded-lg border  bg-gray-800 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Your message..."
                            ></textarea>
                            <button
                              onClick={() => {
                                sendMessage();
                              }}
                              type="submit"
                              className="inline-flex justify-center p-2   cursor-pointer "
                            >
                              <svg
                                className="w-5 h-5 rotate-90 rtl:-rotate-90 text-blue-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 18 20"
                              >
                                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                              </svg>
                              <span className="sr-only">Send message</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!showChatBar && (
              <div
                className="absolute bottom-16 right-6"
                onClick={() => setShowChatBar(!showChatBar)}
              >
                <div className="bg-black rounded-full p-2 opacity-70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="text-white w-12 h-12 animate-pulse"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>
              </div>
            )}

            {!pollResultBox && poll && (
              <div
                className="fixed bottom-12 left-6"
                onClick={() => setPollResultBox(!pollResultBox)}
              >
                <div className="bg-black rounded-full p-2 opacity-70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="text-white w-12 h-12 animate-pulse"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* <div className="top-6 left-4  fixed">
          <div className="flex space-x-1">
            <div>
              <div className="bg-red-600   rounded-md animate-pulse px-2.5 py-1">
                <h1 className="text-white text-xs">Live</h1>
              </div>
            </div>

            <div className="bg-gray-800 rounded-md px-2.5 py-1 opacity-80">
              <div className="flex text-xs space-x-1 text-white items-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                </div>
                <div>{roomInUser}</div>
              </div>
            </div>
          </div>
        </div> */}

        <div ref={bottomOfChat} />
      </div>

      </div>

      
    </>
  );
}
