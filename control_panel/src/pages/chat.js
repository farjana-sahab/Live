import { useEffect, useState } from "react";

export default function chat() {

    const [data, setData] = useState([]);
    const [inputData, setInputData] = useState('');
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const connection = new WebSocket('ws://20.44.206.44:8000/ws');

        connection.onmessage = function (e) {
            const json = JSON.parse(e.data)
            setData((prevData) => [...prevData, json]);

        };

        setConnection(connection);

        // return () => {
        //   connection.close();
        // };
    }, []);

    return (
        <>
            <div className="my-10">
                <h1 className="text-center text-2xl">chat</h1>

                <div className="m-10">
                    {data?.map((item, index) => (
                        <div className="flex space-x-2" key={index}>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>

                        </div>

                        <div>
                            {item?.message}
                        </div>

                    </div>

                    ))}
                    

                </div>




            </div>
        </>
    )
}