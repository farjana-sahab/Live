import { useEffect, useState } from "react";
import axios from "axios";
import calculate_time_ago from "../../helpers/time_age_calculate";
import video_status from "../../helpers/video_status";
import Link from "next/link";
import { useRouter } from "next/router";

export default function AddLive() {
  const [modal, setModal] = useState(false);
  const [liveData, setLiveData] = useState();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const router = useRouter();

  function handleModalState() {
    setModal(!modal);
  }

  async function load_live_room() {
    await axios
      .get(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/live`)
      .then((res) => {
        setLiveData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    load_live_room();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const data = {
      title: title,
    };
    await axios
      .post(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/create_live`, data)
      .then((res) => {
        console.log(res.data);
        setLoading(false);
        setTitle("");
        load_live_room();
        handleModalState();
      });
  }

  function push_to_live_room(id) {
    router.push({
      pathname: `/live/${id}`,
    });
  }

  function copy_to_clipboard(e, item) {
    e.stopPropagation();

    navigator.clipboard.writeText(item?.live_key);
    alert("copied to clipboard");
  }

  return (
    <>
      <div>
        {modal && (
          <div
            id="popup-modal"
            className="h-screen place-items-center fixed flex justify-center top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-100 max-h-full bg-gray-800 bg-opacity-80"
          >
            <div className="relative w-full max-w-md max-h-full">
              <div className="relative bg-gray-900 rounded-lg shadow">
                <button
                  onClick={handleModalState}
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
                    <div>
                      <label className="block mb-2 text-sm font-medium  text-white">
                        Room title
                      </label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        type="text"
                        className=" border  text-sm rounded-lg   block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="flex pb-2 pt-4">
                      <div onClick={() => handleModalState()}>
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

        <div className="text-white">
          <h1 className=" text-2xl text-white ">Live Room</h1>
          <div className="py-4 ">
            <button
              type="button"
              onClick={() => handleModalState()}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 me-2 mb-2 "
            >
              <div className="flex space-x-2 items-center  ">
                <div>+</div>
                <div>Create live room</div>
              </div>
            </button>
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-400 ">
            <thead className="text-xs  uppercase bg-gray-700 text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Live room title
                </th>
                <th scope="col" className="px-6 py-3">
                  Stream key
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Created at
                </th>
              </tr>
            </thead>
            <tbody>
              {liveData?.results?.map((item, index) => (
                <tr
                  className=" border-b bg-gray-800 border-gray-700  hover:bg-gray-600"
                  key={index}
                  role="button"
                  onClick={() => push_to_live_room(item?.id)}
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium   text-white"
                  >
                    {item?.title}
                  </th>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium   text-white"
                    onClick={(e) => copy_to_clipboard(e, item)}
                  >
                    <span className="flex space-x-2 items-center">
                      <span>{item?.live_key}</span>
                      <span title="copy to clipboard">
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
                            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                          />
                        </svg>
                      </span>
                    </span>
                  </th>

                  <th
                    scope="row"
                    className="px-6 py-4 font-medium   text-white"
                  >
                    {video_status(item?.video_status)}
                    {video_status(item?.video_status) ===
                      "Currently in live" && (
                      <span className="bg-red-600 rounded-lg px-2.5 py-1 mx-2 animate-pulse">
                        Live
                      </span>
                    )}
                  </th>

                  <th
                    scope="row"
                    className="px-6 py-4 font-medium   text-white"
                  >
                    {calculate_time_ago(item?.created_at)}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
