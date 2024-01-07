import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import calculate_time_ago from "../../../../helpers/time_age_calculate";
import VideoPlayer from "../../../../components/live/video_player";
import LiveVideoPlayer from "../../../../components/live/live_video_player";

export default function live_detail() {
  const [liveData, setLiveData] = useState();
  const [loading, setLoading] = useState(false);
  const [poll, setPoll] = useState();
  const router = useRouter();
  const { id } = router?.query;
  // chat socket connection
  const [connection, setConnection] = useState(null);
  const [chatData, setChatData] = useState([]);

  const [message, setMessage] = useState();

  function stringToHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  useEffect(() => {
    retrive_live_obj();
    retrive_poll_by_live_id();

    // chat connection
    if (id && liveData?.video_status === 5) {
      const connection = new WebSocket(
        `${process.env.NEXT_PUBLIC_LIVE_CHAT_URL}/${id}/${stringToHashCode("LIVE MCQ")}/`
      );
      connection.onmessage = function (e) {
        const json = JSON.parse(e.data);

        setChatData((prevData) => {
          const has_any = prevData.find((item) => item?.data?.chat_id === json?.data?.chat_id)
          if (has_any) {
            return prevData
          }
          return [...prevData, json];
        });
      };

      setConnection(connection);
    }
  }, [router?.query, liveData?.video_status]);

  // useEffect(() => {
  //     console.log('chatData updated:', chatData);
  // }, [chatData]);

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

  async function retrive_poll_by_live_id() {
    if (id) {
      await axios
        .get(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/get_poll?live_id=${id}`)
        .then((res) => {
          setPoll(res?.data?.results);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  const [pollModalState, setPollModalState] = useState(false);

  function poll_modal() {
    setPollModalState(!pollModalState);
  }

  const [title, setTile] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correct_ans, setCorrectAns] = useState("");

  function json_to_array(data) {
    const optionArray = Object.entries(data).map(([key, value]) => ({
      id: key,
      value,
    }));

    return optionArray;
  }

  const [publishResultModal, setPublishResultModal] = useState(false);

  function show_poll(item) {
    setPublishPollModal(!publishPollModal);
    setSelectedQuestion(item);
  }

  function publish_result_btn(item) {
    setPublishResultModal(!publishResultModal);
    setSelectedQuestionForResultPublish(item);
  }

  function published_poll() {
    setShowQuestion(!showQuestion);
    setPublishPollModal(!publishPollModal);

    if (connection) {
      let data = {
        poll_id: selectedQuestion?.id,
        message: "POLL",
        user_name: "Live MCQ",
      };

      const jsonData = JSON.stringify(data);
      connection.send(jsonData);
    }
  }

  function published_result() {
    setPublishResultModal(!publishResultModal);
    if (connection) {
      let data = {
        poll_id: selectedQuestionForResultPublish?.id,
        message: "RESULT",
        user_name: "Live MCQ",
      };

      const jsonData = JSON.stringify(data);
      connection.send(jsonData);
    }
  }

  function close_show_poll() {
    setPublishPollModal(!publishPollModal);
  }

  const [selectedQuestion, setSelectedQuestion] = useState();
  const [
    selectedQuestionForResultPublish,
    setSelectedQuestionForResultPublish,
  ] = useState();
  const [showQuestion, setShowQuestion] = useState(false);
  const [publishPollModal, setPublishPollModal] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const data = {
      live_id: parseInt(id),
      question: title,
      duration: 0,
      option: {
        1: option1,
        2: option2,
        3: option3,
        4: option4,
      },
      correct_ans: parseInt(correct_ans),
    };
    await axios
      .post(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/add_question`, data)
      .then((res) => {
        console.log(res.data);
        setTile("");
        setOption1("");
        setOption2("");
        setOption3("");
        setOption4("");
        setCorrectAns("");
        poll_modal();
        retrive_poll_by_live_id();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const bottomOfChat = useRef(null);
  const chatContainer = useRef(null);

  useEffect(() => {
    if (chatContainer.current && bottomOfChat.current) {
      const scrollHeight = chatContainer.current.scrollHeight;
      const height = chatContainer.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainer.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, [chatData]);

  const [replyObj, setReplyObj] = useState();

  function select_for_reply(item) {
    setReplyObj(item);
  }

  function cancel_reply() {
    setReplyObj("");
  }

  function sendMessage() {
    if (connection) {
      let data = {};
      if (!replyObj) {
        data = {
          message: message,
          live_id: parseInt(id),
          user_id: 1,
          user_name: "Live MCQ",
        };
      } else {
        data = {
          message: message,
          live_id: parseInt(id),
          user_id: 1,
          user_name: "Live MCQ",
          reply_for: replyObj?.data?.chat_id,
        };
      }
      const jsonData = JSON.stringify(data);
      connection.send(jsonData);
      setMessage("");
      setReplyObj("");
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



  return (
    <>
      <div className="bg-[#111827] h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto relative">
          <div className="py-[2rem]  z-[100] bg-[#111827] opacity-90">
            <Link href="/admin">
              <div className="flex space-x-2 items-center" role="button">
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
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="text-white">Home</h1>
                </div>
              </div>
            </Link>

            <div>
              <h2 className="my-4 text-white text-2xl">
                Live room {liveData?.id}
              </h2>
            </div>
            <div>
              <h2 className="my-4">
                <span className=" text-white text-md">Stream key </span>
                <span className=" text-white text-xl font-semibold">
                  {" "}
                  {liveData?.live_key}
                </span>
              </h2>
            </div>
            

            {liveData?.video_status === 5 && (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <div className="w-full h-[480px] rounded-lg bg-black">
                    {/* https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8 */}
                    {/* demo link of hls */}
                    {
                      liveData?.live_key && (
                        <LiveVideoPlayer src={`${process.env.NEXT_PUBLIC_LIVE_STREMING_VIDEO_URL}/${liveData?.live_key}/index.m3u8`} />
                        // <VideoPlayer
                        //   src={`${process.env.NEXT_PUBLIC_LIVE_STREMING_VIDEO_URL}/${liveData?.live_key}/index.m3u8`}
                        // />
                      )
                      // <VideoPlayer src={`${process.env.NEXT_PUBLIC_LIVE_STREMING_VIDEO_URL}/${liveData?.live_key}/index.m3u8`} />
                    }
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="w-full h-[480px] overflow-auto  rounded-lg  relative " ref={chatContainer}>
                    <div  className="">
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

                                      <div className="flex space-x-2 items-center">
                                        <div
                                          className="flex-shrink-0 flex-grow-0 w-8 h-8 rounded-full overflow-hidden bg-indigo-800"

                                        >
                                          <h1 className="w-full h-full flex items-center justify-center text-center font-bold text-white">
                                            {getFirstWord(
                                              item?.data?.user_name
                                            )}
                                          </h1>
                                        </div>
                                        <div className="flex-grow">
                                          <h1 className="text-gray-500">
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

                              {item?.type === "poll_init" && (
                                <>
                                  <h1 className="text-center text-green-300 animate-pulse ">
                                    "{selectedQuestion?.question} - poll
                                    initiate"
                                  </h1>
                                </>
                              )}

                              {item?.type === "result_init" && (
                                <>
                                  <h1 className="text-center text-green-300 animate-pulse ">
                                    "
                                    {selectedQuestionForResultPublish?.question}{" "}
                                    - result published"
                                  </h1>
                                </>
                              )}
                            </div>
                          ))}


                        </>
                      )}

                    
                    </div>

                    <div className=" sticky w-full bg-gray-700 bottom-0 ">
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



                      <div className="flex py-4">
                        <textarea
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          value={message}
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
                          className="inline-flex justify-center p-2  rounded-full cursor-pointer text-blue-500 hover:bg-gray-600"
                        >
                          <svg
                            className="w-5 h-5 rotate-90 rtl:-rotate-90"
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
                    

                    <div ref={bottomOfChat}></div>
                  </div>
                  
                </div>
                
              </div>
              
            )}

            {liveData?.video_status === 3 && (
              <div className=" overflow-x-auto shadow-md rounded-lg mt-10">
                <table className="w-full text-sm text-left rtl:text-right text-gray-400 rounded-md">
                  <thead className="text-xs  uppercase bg-gray-700 text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                      <tr
                        className=" border-b bg-gray-800 border-gray-700  "
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          720 Pixel 
                        </th>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          {liveData.meta_data?.['720p']}
                        </th>

                      </tr>
                      <tr
                        className=" border-b bg-gray-800 border-gray-700  "
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          480 Pixel 
                        </th>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          {liveData.meta_data?.['480p']}
                        </th>

                      </tr>
                      <tr
                        className=" border-b bg-gray-800 border-gray-700  "
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          240 Pixel
                        </th>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          {liveData.meta_data?.['240p']}
                        </th>

                      </tr>

                      <tr
                        className=" border-b bg-gray-800 border-gray-700  "
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          HLS index file
                        </th>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          {liveData.meta_data?.hls_m3u8}
                        </th>

                      </tr>

                      <tr
                        className=" border-b bg-gray-800 border-gray-700  "
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          HLS folder link
                        </th>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          {liveData.meta_data?.hls}
                        </th>

                      </tr>

                  </tbody>
                </table>
              </div>

            )

            }

            {/* pool */}


            <div>

            <div>
            <div className="py-4 ">
              <button
                type="button"
                onClick={() => poll_modal()}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 "
              >
                <div className="flex space-x-2 items-center  ">
                  <div>+</div>
                  <div>Create poll</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            {poll && (
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-96">
                <table className="w-full text-sm text-left rtl:text-right text-gray-400 ">
                  <thead className="text-xs  uppercase bg-gray-700 text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Question
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Option
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Created at
                      </th>

                      <th scope="col" className="px-6 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Publish result
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {poll?.map((item, index) => (
                      <tr
                        className=" border-b bg-gray-800 border-gray-700  "
                        key={item?.id}
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          {item?.question}
                        </th>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          <div>
                            {json_to_array(item?.option)?.map((item, index) => (
                              <div key={index}>
                                option {item?.id} - {item?.value}
                              </div>
                            ))}
                          </div>
                        </th>

                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          {calculate_time_ago(item?.created_at)}
                        </th>

                        <th
                          role="button"
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          {liveData?.video_status === 5 && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              onClick={() => show_poll(item)}
                              className={
                                selectedQuestion?.id === item?.id &&
                                showQuestion
                                  ? "w-8 h-8 text-green-700 transition ease-in duration-300"
                                  : "w-6 h-6 transition ease-out duration-30"
                              }
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          )}
                        </th>

                        <th
                          scope="row"
                          className="px-6 py-4 font-medium   text-white"
                        >
                          {liveData?.video_status === 5 && (
                            <button
                              className="bg-blue-600 rounded-lg px-2.5 py-1.5 hover:bg-blue-800"
                              onClick={(e) => publish_result_btn(item)}
                            >
                              Publish
                            </button>
                          )}
                        </th>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

            </div>
         

            
          </div>

          {/* poll modal */}

          {pollModalState  && (
            <div
              id="popup-modal"
              className="h-screen place-items-center fixed flex justify-center top-0 left-0 right-0 z-[200] p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-100 max-h-full bg-gray-800 bg-opacity-80 "
            >
              <div className="relative w-full max-w-lg max-h-full z-[200]">
                <div className="relative bg-gray-900 rounded-lg shadow">
                  <button
                    onClick={poll_modal}
                    type="button"
                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-800 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                    data-modal-hide="popup-modal"
                  >
                    <svg
                      className="w-3 h-3 text-red-600"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                  <div className="px-6 pb-4 pt-10">
                    <form onSubmit={(e) => submit(e)}>
                      <div className="mb-2">
                        <label className="block mb-2 text-sm font-medium  text-white">
                          Question
                        </label>
                        <textarea
                          value={title}
                          onChange={(e) => setTile(e?.target?.value)}
                          type="text"
                          className=" border  text-sm rounded-lg   block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block mb-2 text-sm font-medium  text-white">
                          Option 1
                        </label>
                        <input
                          value={option1}
                          onChange={(e) => setOption1(e?.target?.value)}
                          type="text"
                          className=" border  text-sm rounded-lg   block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block mb-2 text-sm font-medium  text-white">
                          Option 2
                        </label>
                        <input
                          value={option2}
                          onChange={(e) => setOption2(e?.target?.value)}
                          type="text"
                          className=" border  text-sm rounded-lg   block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block mb-2 text-sm font-medium  text-white">
                          Option 3
                        </label>
                        <input
                          value={option3}
                          onChange={(e) => setOption3(e?.target?.value)}
                          type="text"
                          className=" border  text-sm rounded-lg   block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block mb-2 text-sm font-medium  text-white">
                          Option 4
                        </label>
                        <input
                          value={option4}
                          onChange={(e) => setOption4(e?.target?.value)}
                          type="text"
                          className=" border  text-sm rounded-lg   block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="mb-2">
                        <label className="block mb-2 text-sm font-medium  text-white">
                          Correct answer
                        </label>
                        <input
                          onWheel={(e) => e.target.blur()}
                          value={correct_ans}
                          onChange={(e) => setCorrectAns(e?.target?.value)}
                          type="number"
                          className="wheel-prevent border  text-sm rounded-lg   block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="flex pb-2 pt-4">
                        <div onClick={() => poll_modal()}>
                          <button
                            type="button"
                            className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-1.5 "
                          >
                            Cancel
                          </button>
                        </div>
                        <div>
                          <button
                            type="submit"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-1.5 "
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {publishResultModal && liveData?.video_status === 5 && (
            <div
              id="popup-modal"
              className="h-screen place-items-center fixed flex justify-center top-0 left-0 right-0 z-[200] p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-100 max-h-full bg-gray-800 bg-opacity-80"
            >
              <div className="relative w-full max-w-md max-h-full">
                <div className="relative bg-gray-900 rounded-lg shadow">
                  <button
                    onClick={() => setPublishResultModal(!publishResultModal)}
                    type="button"
                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-800 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                    data-modal-hide="popup-modal"
                  >
                    <svg
                      className="w-3 h-3 text-red-600"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>

                  <div className="px-6 py-10">
                    <h1 className="text-white mb-2 text-xl">
                      Question - {selectedQuestionForResultPublish?.question}
                    </h1>
                    <div className="text-white mb-2">
                      {json_to_array(
                        selectedQuestionForResultPublish?.option
                      )?.map((item, index) => (
                        <div key={index}>
                          option {item?.id} - {item?.value}
                        </div>
                      ))}
                    </div>

                    <div className="flex pt-4">
                      <div
                        onClick={() =>
                          setPublishResultModal(!publishResultModal)
                        }
                      >
                        <button
                          type="button"
                          className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-1.5 "
                        >
                          Cancel
                        </button>
                      </div>
                      <div>
                        <button
                          type="submit"
                          onClick={() => published_result()}
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-1.5 "
                        >
                          Publish Result
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {publishPollModal && liveData?.video_status === 5 && (
            <div
              id="popup-modal"
              className="h-screen place-items-center fixed flex justify-center top-0 left-0 right-0 z-[200] p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-100 max-h-full bg-gray-800 bg-opacity-80"
            >
              <div className="relative w-full max-w-md max-h-full">
                <div className="relative bg-gray-900 rounded-lg shadow">
                  <button
                    onClick={() => close_show_poll()}
                    type="button"
                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-800 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                    data-modal-hide="popup-modal"
                  >
                    <svg
                      className="w-3 h-3 text-red-600"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>

                  <div className="px-6 py-10">
                    <h1 className="text-white mb-2 text-xl">
                      Question - {selectedQuestion?.question}
                    </h1>
                    <div className="text-white mb-2">
                      {json_to_array(selectedQuestion?.option)?.map(
                        (item, index) => (
                          <div key={index}>
                            option {item?.id} - {item?.value}
                          </div>
                        )
                      )}
                    </div>

                    <div className="flex pt-4">
                      <div onClick={() => close_show_poll()}>
                        <button
                          type="button"
                          className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-1.5 "
                        >
                          Cancel
                        </button>
                      </div>
                      <div>
                        <button
                          type="submit"
                          onClick={() => published_poll()}
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 me-2 mb-1.5 "
                        >
                          Publish
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          
        </div>


      </div>
    </>
  );
}
