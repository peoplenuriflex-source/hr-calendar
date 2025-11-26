'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Upload, Database, Menu, X, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [hasUnread, setHasUnread] = useState(true) // Mock unread state
    const [isDesktopOpen, setIsDesktopOpen] = useState(true)

    const menuItems = [
        { name: '캘린더', icon: Calendar, path: '/' },
        { name: '일괄 입력', icon: Upload, path: '/bulk-input' },
        { name: '알림 센터', icon: Bell, path: '/notifications' },
    ]

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40 shadow-sm">
                <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-600">
                    <Menu size={24} />
                </button>
                <span className="font-bold text-lg text-gray-900">인사 캘린더</span>
                <Link
                    href={pathname === '/notifications' ? '/' : '/notifications'}
                    className="p-2 -mr-2 text-gray-600 relative"
                >
                    <Bell size={24} />
                    {hasUnread && pathname !== '/notifications' && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                    )}
                </Link>
            </div>

            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                className={`
                    fixed top-0 left-0 bottom-0 bg-white border-r border-gray-100 z-50
                    lg:static lg:h-screen lg:shadow-none shadow-2xl transition-all duration-300
                    ${isDesktopOpen ? 'lg:w-72' : 'lg:w-20'}
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                initial={false}
            >
                <div className={`p-6 flex items-center ${isDesktopOpen ? 'justify-between' : 'justify-center'}`}>
                    {isDesktopOpen ? (
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight whitespace-nowrap">HR Calendar</h1>
                    ) : (
                        <span className="font-bold text-blue-600">HR</span>
                    )}

                    {/* Mobile Close Button */}
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 -mr-2 text-gray-500">
                        <X size={24} />
                    </button>

                    {/* Desktop Toggle Button */}
                    <button
                        onClick={() => setIsDesktopOpen(!isDesktopOpen)}
                        className="hidden lg:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        {isDesktopOpen ? <Menu size={20} /> : <Menu size={24} />}
                    </button>
                </div>

                <nav className="px-4 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium
                  ${isActive
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  ${!isDesktopOpen && 'justify-center px-2'}
                `}
                                title={!isDesktopOpen ? item.name : ''}
                            >
                                <item.icon size={20} className="shrink-0" />
                                {isDesktopOpen && (
                                    <>
                                        <span className="whitespace-nowrap">{item.name}</span>
                                        {item.name === '알림 센터' && hasUnread && (
                                            <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                    </>
                                )}
                                {!isDesktopOpen && item.name === '알림 센터' && hasUnread && (
                                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-white" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {isDesktopOpen && (
                    <div className="absolute bottom-8 left-0 right-0 px-8">
                        <div className="bg-blue-50 p-4 rounded-2xl">
                            <h4 className="font-bold text-blue-900 mb-1">팀 공지사항</h4>
                            <p className="text-sm text-blue-700 leading-relaxed">
                                이번 달 급여일은 25일입니다.<br />
                                잊지 말고 확인하세요!
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    )
}
