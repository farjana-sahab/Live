import Link from "next/link";
import { useState } from "react";
import Cookie from 'js-cookie';
import axios from "axios";
import { useRouter } from "next/router";
import normalModal from "../../components/normal_modal";
import NormalModal from "../../components/normal_modal";
export default function login() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const [modal, setModal] = useState(false);
    function handleModalState(){
        setModal(!modal);
    }

    async function submit(e) {
        e.preventDefault();
        setLoading(true)


        const data = {
            phone_number: phoneNumber,
            password: password
        }

        await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/login`, data)
            .then(res => {
                setLoading(false)
                Cookie.set('token', res?.data?.results);
                router.push({
                    pathname: '/admin',
                })
            })
            .catch(err => {
                setModal(!modal)
                if (err?.response?.data?.detail?.[0]?.msg) {
                    setError(err?.response?.data?.detail?.[0]?.msg)
                }
                else {
                    console.log(err?.response?.data?.detail)
                    setError(err?.response?.data?.detail)

                }
                setLoading(false)
                // console.log(err?.response?.data?.detail?.[0]?.msg)

            })

    }

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
                                onClick={() => handleModalState()}
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
                                    {error}


                                </h1>


                            </div>




                        </div>
                    </div>
                </div>
            }






            <section className="bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white uppercase font-mono">
                        Cracktech
                    </div>
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Login
                            </h1>
                            <form className="space-y-4 md:space-y-6" onSubmit={(e) => submit(e)}>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your phone number</label>
                                    <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} type="text" name="phone_number" id="phone_number" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="01XXXXXXXXXX" required />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                                </div>
                                {/* <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                                    <input type="confirm-password" name="confirm-password" id="confirm-password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                </div> */}
                                {/* <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="terms" aria-describedby="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label for="terms" className="font-light text-gray-500 dark:text-gray-300">I accept the <span className="font-medium text-primary-600 hover:underline dark:text-primary-500" >Terms and Conditions</span></label>
                                    </div>
                                </div> */}
                                <button disabled={loading} type="submit" className={`w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${loading ? 'animate-pulse' : ''}`}> {loading ? 'loading...' : 'Login'}</button>

                                {/* <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Don't have an account?

                                    <Link href="/signup">
                                        <span className="font-medium text-primary-600 hover:underline dark:text-primary-500">create one</span>
                                    </Link>

                                </p> */}
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}