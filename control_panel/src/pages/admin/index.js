import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AddLive from "../../../components/live/add_live";

export default function admin_home() {
  const router = useRouter();

  // const [data, setData] = useState('');
  // const [inputData, setInputData] = useState('');
  // const [connection, setConnection] = useState(null);

  // const [modalState, setModalState] = useState(false)

  // const [preview, setPreview] = useState(false)

  // function handleModalState(e) {
  //     e.preventDefault()
  //     setModalState(!modalState)
  // }

  // useEffect(() => {
  //     const connection = new WebSocket('ws://localhost:8000/ws');

  //     // connection.onmessage = function (e) {
  //     //   const json = JSON.parse(e.data)
  //     //   setData(json);

  //     //   console.log(json)
  //     // };

  //     setConnection(connection);

  //     // return () => {
  //     //   connection.close();
  //     // };
  // }, []);

  // const [formData, setFormData] = useState({
  //     adds: {
  //         title: '',
  //         description: '',
  //     },
  // });

  // const handleInputChange = (e) => {
  //     const { name, value } = e.target;
  //     setFormData({
  //         ...formData,
  //         adds: {
  //             ...formData.adds,
  //             [name]: value,
  //         },
  //     });

  // };

  // const submit = (e) => {
  //     setPreview(!preview)
  //     e.preventDefault();

  //     if (connection) {
  //         connection.send(JSON.stringify(formData));
  //         console.log('preview', preview)
  //         setTimeout(() => {
  //             setFormData({
  //                 adds: {
  //                     title: '',
  //                     description: '',
  //                 },
  //             });
  //         }, 5000);
  //         setTimeout(() => {
  //             setPreview(!preview)
  //             console.log('preview', preview)
  //             setModalState(!modalState)

  //         }, 5000);

  //     }
  // };
  const [currentTab, setCurrentTab] = useState("live");

  function tab(tab_name) {
    setCurrentTab(tab_name);
    router.push({
      pathname: "/admin",
      query: { tab: tab_name },
    });
  }

  return (
    <>
      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-[100vh] transition-transform -translate-x-full sm:translate-x-0 border-r-[1px] border-gray-700 shadow-r-md"
        aria-label="Sidebar"
      >
        <div className="h-screen px-3 py-4 overflow-y-auto bg-[#111827]">
          <div>
            <h1 className="text-center text-white py-10 font-semibold text-xl">
              CrackTech
            </h1>
          </div>
          <ul className="space-y-2 font-medium">
            <li onClick={() => tab("live")}>
              <span
                className={
                  currentTab === "live"
                    ? "flex items-center p-2  rounded-lg text-white  bg-gray-700 group"
                    : "lex items-center p-2  rounded-lg text-white  hover:bg-gray-700 group"
                }
              >
                <svg
                  className="w-5 h-5 transition duration-75 text-gray-400 group-hover: group-hover:text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ml-3">Live</span>
              </span>
            </li>
            
          </ul>
        </div>
      </aside>

      <div className="h-screen bg-[#111827] px-6 md:pl-[19rem] py-14">
        {/* <div className="my-8">
                    <h1 className="text-xl font-semibold text-white">Promotion</h1>
                </div>

                <form className="mr-4 md:mr-10" >
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                        <input name="title"
                            value={formData?.adds?.title}
                            onChange={handleInputChange}
                            type="text"
                            id="title"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <textarea name="description" value={formData?.adds?.description}
                            onChange={handleInputChange} rows="4" type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                    </div>

                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleModalState}>Submit</button>
                </form> */}
        <div>
          <AddLive />
        </div>
      </div>
    </>
  );
}
