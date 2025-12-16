import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'


export default function AuthLayout() {
    return (
        <div className="min-h-screen grid place-items-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
            <motion.div initial={{ scale: .98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className=" card w-full max-w-md ">
                {/* <Link to="/" className="text-2xl font-semibold">IntelliStore</Link> */}
                <div className="auth-bg-lines p-6 rounded-lg">
                    <Outlet />
                </div>
            </motion.div>
        </div>
    )
}