import Image from 'next/image'
import { useEffect, useState } from 'react';


export default function Home() {

  const [data, setData] = useState('');
  const [inputData, setInputData] = useState('');
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const connection = new WebSocket('ws://20.44.206.44:8000/ws');

    connection.onmessage = function (e) {
      const json = JSON.parse(e.data)
      setData(json);

      console.log(json)
    };

    setConnection(connection);

    // return () => {
    //   connection.close();
    // };
  }, []);


  const submit = () => {
    if (connection) {
      connection.send(inputData);
    }
  };



  return (
    <div className="flex flex-col h-screen justify-between ">
      <div className="px-8 pt-10 mb-auto">
        <div className="flex space-x-2">
          <div className="rounded-md bg-red-600 animate-pulse">
            <h1 className="px-2.5 py-1 text-white font-semibold">Live</h1>
          </div>
          <div className="bg-gray-700 rounded-md py-1 px-2.5 text-white">
            <div className="flex space-x-1 items-center">
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
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-semibold">{data?.live}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {data?.adds &&
        <footer className="bg-gradient-to-t from-black">

          <div className="px-8 py-10">
            <div className="flex space-x-4">
              <div className="bg-indigo-600 w-2 h-20">

              </div>


              <div >
                <h1 className="font-bold  text-3xl  text-white">{data?.adds?.title}</h1>
                <p className="text-gray-200 text-xl">{data?.adds?.description}</p>
              </div>


            </div>
          </div>


        </footer>
      }




    </div>
  )
}
