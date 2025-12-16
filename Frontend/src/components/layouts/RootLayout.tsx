import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"
import NavBar from "../Home/NavBar"
import ErrorBoundary from "../ErrorBoundary"
import LoginModal from "../LoginModal"
import { Footer, FooterCopyright, FooterIcon, FooterLink, FooterLinkGroup, FooterTitle } from "flowbite-react";
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";
import { useTheme } from "../../theme/ThemeProvider";

export default function RootLayout() {
    const { theme } = useTheme();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [loginAnchor, setLoginAnchor] = useState<{ top: number; left: number; bottom: number; right: number; width: number; height: number } | null>(null);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            {/* Navigation */}
            <ErrorBoundary>
                <NavBar loginModalOpen={loginModalOpen} setLoginModalOpen={setLoginModalOpen} setLoginAnchor={setLoginAnchor} />
            </ErrorBoundary>

            {/* Login Modal */}
            <LoginModal isOpen={loginModalOpen} anchorRect={loginAnchor} onClose={() => { setLoginModalOpen(false); setLoginAnchor(null); }} />

            {/* Main Content */}
            <motion.main
                className="flex-1 w-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="max-w-full m-auto ">
                    <Outlet />
                </div>
            </motion.main>

            {/* Footer */}
            <Footer bgDark className="border-t border-card transition-colors duration-300" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 px-0 sm:px-6 py-8">
                        <div>
                            <FooterTitle title="Company" />
                            <FooterLinkGroup col>
                                <FooterLink href="#" className="hover:text-primary transition">About</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Careers</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Brand Center</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Blog</FooterLink>
                            </FooterLinkGroup>
                        </div>
                        <div>
                            <FooterTitle title="Help center" />
                            <FooterLinkGroup col>
                                <FooterLink href="#" className="hover:text-primary transition">Discord</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Twitter</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Facebook</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Contact Us</FooterLink>
                            </FooterLinkGroup>
                        </div>
                        <div>
                            <FooterTitle title="Legal" />
                            <FooterLinkGroup col>
                                <FooterLink href="#" className="hover:text-primary transition">Privacy Policy</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Licensing</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Terms & Conditions</FooterLink>
                            </FooterLinkGroup>
                        </div>
                        <div className="hidden md:block">
                            <FooterTitle title="Download" />
                            <FooterLinkGroup col>
                                <FooterLink href="#" className="hover:text-primary transition">iOS</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Android</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Windows</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">MacOS</FooterLink>
                            </FooterLinkGroup>
                        </div>
                        <div className="hidden md:block">
                            <FooterTitle title="Follow us" />
                            <FooterLinkGroup col>
                                <FooterLink href="#" className="hover:text-primary transition">GitHub</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Discord</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Twitter</FooterLink>
                                <FooterLink href="#" className="hover:text-primary transition">Facebook</FooterLink>
                            </FooterLinkGroup>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="w-full border-t border-card px-0 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <FooterCopyright by="AI-Powered E-Commerce™" year={2025} />
                        <div className="flex gap-4 sm:gap-6">
                            <FooterIcon href="#" icon={BsFacebook} />
                            <FooterIcon href="#" icon={BsInstagram} />
                            <FooterIcon href="#" icon={BsTwitter} />
                            <FooterIcon href="#" icon={BsGithub} />
                            <FooterIcon href="#" icon={BsDribbble} />
                        </div>
                    </div>
                </div>
            </Footer>
        </div>
    )
}
