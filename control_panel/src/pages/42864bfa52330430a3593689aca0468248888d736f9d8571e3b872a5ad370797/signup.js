import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Cookie from 'js-cookie';

export default function signup() {
    const [otpScreen, setOtpScreen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const router = useRouter();

    async function submit(e) {
        setLoading(true)
        e.preventDefault();
        const data = {
            phone_number: phoneNumber,
            password: password
        }
        await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/create_user`, data)
            .then(res => {
                console.log(res?.data)
                setLoading(false)
                setOtpScreen(true)
            })
            .catch(err => {
                console.log(err)
            })

    }

    async function submit_otp(e) {
        setLoading(true)
        e.preventDefault();

        const data = {
            phone_number: phoneNumber,
            otp: otp
        }

        await axios.post(`${process.env.NEXT_PUBLIC_API_ROOT_URL}/verify_otp`, data)
            .then(res => {
                setLoading(false)
                Cookie.set('token', res?.data?.results);
                router.push({
                    pathname: '/admin',
                })
            })
            .catch(err => {
                console.log(err)
            })
    }



    return (
        <>
            <section className="bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white uppercase font-mono">
                        Cracktech
                    </div>


                    {otpScreen &&
                        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                    Validate your otp
                                </h1>
                                <form className="space-y-4 md:space-y-6" onSubmit={(e) => submit_otp(e)}>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Otp</label>
                                        <input value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            type="text" name="phone_number" id="phone_number" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" />
                                    </div>

                                    <button disabled={loading} type="submit" className={`w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${loading ? 'animate-pulse' : ''}`}> {loading ? 'loading...' : 'Submit'}</button>
                                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">

                                        <Link href="/signup">
                                            <span className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up again</span>

                                        </Link>

                                    </p>
                                </form>
                            </div>
                        </div>
                    }

                    {/* otp screen */}


                    {!otpScreen &&
                        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                    Create an account
                                </h1>
                                <form className="space-y-4 md:space-y-6" onSubmit={(e) => submit(e)}>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your phone number</label>
                                        <input value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            type="text" name="phone_number" id="phone_number" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="01XXXXXXXXXX" required />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                        <input value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
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
                                    <button disabled={loading} type="submit" className={`w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${loading ? 'animate-pulse' : ''}`}> {loading ? 'loading...' : 'Create an account'}</button>


                                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                        Already have an account?
                                        <Link href="/login">
                                            <span className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</span>

                                        </Link>

                                    </p>
                                </form>
                            </div>
                        </div>

                    }



                    {/* signup screen */}

                </div>
            </section>
        </>
    )
}