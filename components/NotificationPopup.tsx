'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell } from 'lucide-react'
import { format, isToday, parseISO } from 'date-fns'
import { Event } from './CalendarView'

type Props = {
    events: Event[]
}

export default function NotificationPopup({ events }: Props) {
    const [todaysEvents, setTodaysEvents] = useState<Event[]>([])
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const today = events.filter(e => isToday(parseISO(e.event_date)))
        if (today.length > 0) {
            setTodaysEvents(today)
            // Show popup after a small delay
            const timer = setTimeout(() => setIsVisible(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [events])

    if (!isVisible || todaysEvents.length === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-16 left-0 right-0 z-40 px-4 md:px-0 flex justify-center pointer-events-none"
            >
                <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl border border-blue-100 p-4 w-full max-w-md pointer-events-auto ring-1 ring-black/5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                            <Bell size={18} className="fill-current" />
                            <span className="text-sm">오늘의 일정 ({todaysEvents.length})</span>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {todaysEvents.map(event => (
                            <div key={event.id} className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 flex items-center gap-3">
                                <div className={`w-1.5 h-8 rounded-full bg-blue-500 shrink-0`} />
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">{event.title}</div>
                                    {event.description && (
                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{event.description}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
