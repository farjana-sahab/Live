import { useState } from "react";

export default function NormalModal({message}){
    const [modal, setModal] = useState(false);
    function handleModalState(){
        setModal(!modal);
    }
    console.log(modal)
    return (
        <>
        
        {modal &&
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
                                <div className="text-white px-6 pb-4 pt-10" >
                                    <h1 className="py-4 text-center">
                                    {message}


                                    </h1>


                                </div>




                            </div>
                        </div>
                    </div>
                }
        </>
    )
}