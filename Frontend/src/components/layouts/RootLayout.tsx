// import React from "react"
import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import NavBar from "../Home/NavBar"

// import {
//     ShoppingCart,
//     UserCircle2,
//     LayoutDashboard,
//     Package,
//     Store,
// } from "lucide-react"
import { Footer, FooterCopyright, FooterIcon, FooterLink, FooterLinkGroup, FooterTitle } from "flowbite-react";
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";


// import { useSelector, useDispatch } from "react-redux"
// import type { RootState, AppDispatch } from "../../store"
// import { logout } from "../../store/auth"   

// const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
//     const { pathname } = useLocation()
//     const active = pathname === to
//     return (
//         <Link
//             to={to}
//             className={`px-3 py-2 rounded-xl ${active
//                 ? "bg-zinc-900 text-white"
//                 : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                 }`}
//         >
//             {children}
//         </Link>
//     )
// }

export default function RootLayout() {
    // const dispatch = useDispatch<AppDispatch>()

    // ✅ get auth state from Redux
    // const { role } = useSelector((state: RootState) => state.auth)

    // // ✅ logout handler
    // const handleLogout = () => {
    //     dispatch(logout())
    //     location.href = "/login" // optional redirect
    // }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            {/* <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/60 border-b border-zinc-200/60 dark:border-zinc-800">
                <div className="container flex items-center justify-between py-3 gap-4">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                        <Package className="w-5 h-5" /> IntelligentStore
                    </Link>
                    <nav className="flex items-center gap-2">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/cart">
                            <ShoppingCart className="w-4 h-4" />
                        </NavLink>
                        {role === "seller" && (
                            <NavLink to="/seller">
                                <Store className="w-4 h-4" />
                            </NavLink>
                        )}
                        {role === "admin" && (
                            <NavLink to="/admin">
                                <LayoutDashboard className="w-4 h-4" />
                            </NavLink>
                        )}
                        <button onClick={handleLogout} className="btn-outline">
                            <UserCircle2 className="w-4 h-4" /> Logout
                        </button>
                    </nav>
                </div>
            </header> */}
            <NavBar />
            <motion.main
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="py-6">
                    <Outlet />
                </div>
            </motion.main>

            <Footer bgDark>
                <div className="w-full">
                    <div className="grid w-full grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4">
                        <div>
                            <FooterTitle title="Company" />
                            <FooterLinkGroup col>
                                <FooterLink href="#">About</FooterLink>
                                <FooterLink href="#">Careers</FooterLink>
                                <FooterLink href="#">Brand Center</FooterLink>
                                <FooterLink href="#">Blog</FooterLink>
                            </FooterLinkGroup>
                        </div>
                        <div>
                            <FooterTitle title="help center" />
                            <FooterLinkGroup col>
                                <FooterLink href="#">Discord Server</FooterLink>
                                <FooterLink href="#">Twitter</FooterLink>
                                <FooterLink href="#">Facebook</FooterLink>
                                <FooterLink href="#">Contact Us</FooterLink>
                            </FooterLinkGroup>
                        </div>
                        <div>
                            <FooterTitle title="legal" />
                            <FooterLinkGroup col>
                                <FooterLink href="#">Privacy Policy</FooterLink>
                                <FooterLink href="#">Licensing</FooterLink>
                                <FooterLink href="#">Terms &amp; Conditions</FooterLink>
                            </FooterLinkGroup>
                        </div>
                        <div>
                            <FooterTitle title="download" />
                            <FooterLinkGroup col>
                                <FooterLink href="#">iOS</FooterLink>
                                <FooterLink href="#">Android</FooterLink>
                                <FooterLink href="#">Windows</FooterLink>
                                <FooterLink href="#">MacOS</FooterLink>
                            </FooterLinkGroup>
                        </div>
                    </div>
                    <div className="w-full bg-gray-700 px-4 py-6 sm:flex sm:items-center sm:justify-between ">
                        <FooterCopyright href="#" by="AI Powered Store" year={new Date().getFullYear()} />
                        <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
                            <FooterIcon href="#" icon={BsFacebook} />
                            <FooterIcon href="#" icon={BsInstagram} />
                            <FooterIcon href="#" icon={BsTwitter} />
                            <FooterIcon href="#" icon={BsGithub} />
                            <FooterIcon href="#" icon={BsDribbble} />
                        </div>
                    </div>
                </div>
            </Footer>
        </div >
    )
}
