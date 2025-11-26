'use client'

import { useState, useEffect, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, startOfWeek, endOfWeek, addDays, isWeekend, getDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, MapPin, Calendar as CalendarIcon, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/utils/supabase/client'
import EventModal from './EventModal'
import NotificationPopup from './NotificationPopup'
import { isHoliday, getHolidayName } from '@/utils/holidays'

export type EventType = 'payroll' | 'settlement' | 'onboarding' | 'resignation' | 'vacation' | 'education' | 'notice' | 'other'

export type Event = {
    id: string
    title: string
    description: string | null
    event_date: string
    type: EventType
    memo?: string
}

const EVENT_STYLES: Record<EventType, { bg: string, text: string, label: string }> = {
    payroll: { bg: 'bg-green-100', text: 'text-green-700', label: '급여지급' },
    settlement: { bg: 'bg-orange-100', text: 'text-orange-700', label: '정산마감' },
    onboarding: { bg: 'bg-blue-100', text: 'text-blue-700', label: '입사' },
    resignation: { bg: 'bg-gray-100', text: 'text-gray-700', label: '퇴사' },
    vacation: { bg: 'bg-purple-100', text: 'text-purple-700', label: '단체연차' },
    education: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '교육' },
    notice: { bg: 'bg-pink-100', text: 'text-pink-700', label: '공지' },
    other: { bg: 'bg-gray-50', text: 'text-gray-600', label: '기타' },
}

type ViewMode = 'month' | 'week' | 'day'

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<Event[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('month')
    const [loading, setLoading] = useState(true)
    const todayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchEvents()
    }, [currentDate])

    // Auto-scroll to today on mount
    useEffect(() => {
        if (todayRef.current) {
            setTimeout(() => {
                todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 500)
        }
    }, [events, viewMode])

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')

            if (error) throw error

            if (data) {
                setEvents(data as Event[])
            }
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    const navigateDate = (direction: 'prev' | 'next') => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1))
        } else if (viewMode === 'week') {
            setCurrentDate(addDays(currentDate, direction === 'next' ? 7 : -7))
        } else {
            setCurrentDate(addDays(currentDate, direction === 'next' ? 1 : -1))
        }
    }

    const getDaysToRender = () => {
        if (viewMode === 'month') {
            const monthStart = startOfMonth(currentDate)
            const monthEnd = endOfMonth(currentDate)
            const start = startOfWeek(monthStart, { weekStartsOn: 0 })
            const end = endOfWeek(monthEnd, { weekStartsOn: 0 })
            return eachDayOfInterval({ start, end })
        } else if (viewMode === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 0 })
            const end = endOfWeek(currentDate, { weekStartsOn: 0 })
            return eachDayOfInterval({ start, end })
        } else {
            return [currentDate]
        }
    }

    const days = getDaysToRender()

    const getEventsForDay = (date: Date) => {
        return events.filter(event => isSameDay(parseISO(event.event_date), date))
    }

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        setIsModalOpen(true)
    }

    const isRedDay = (date: Date) => {
        return isWeekend(date) || isHoliday(format(date, 'yyyy-MM-dd'))
    }

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto font-sans pb-24">
            <NotificationPopup events={events} />

            {/* Header */}
            <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm py-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                            {format(currentDate, 'M월', { locale: ko })}
                        </h1>
                        <span className="text-gray-500 font-medium text-sm md:text-base">
                            {format(currentDate, 'yyyy년', { locale: ko })}
                        </span>
                    </div>

                    <div className="flex bg-white shadow-sm border border-gray-100 p-1 rounded-full">
                        {(['month', 'week', 'day'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`
                  px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all
                  ${viewMode === mode ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                `}
                            >
                                {mode === 'month' ? '월' : mode === 'week' ? '주' : '일'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button onClick={() => navigateDate('prev')} className="p-2 md:p-3 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => {
                            setCurrentDate(new Date())
                            // Trigger scroll again
                            setTimeout(() => todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
                        }}
                        className="px-4 py-2 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-200 font-medium text-sm transition-colors text-blue-600"
                    >
                        오늘
                    </button>
                    <button onClick={() => navigateDate('next')} className="p-2 md:p-3 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Day Headers (Desktop) */}
            <div className="hidden lg:grid grid-cols-7 gap-4 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div key={day} className={`text-center text-sm font-semibold ${i === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className={`
        grid gap-3 md:gap-4
        ${viewMode === 'month' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-7' : ''}
        ${viewMode === 'week' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-7' : ''}
        ${viewMode === 'day' ? 'grid-cols-1' : ''}
      `}>
                <AnimatePresence mode='wait'>
                    {days.map((day, index) => {
                        const dayEvents = getEventsForDay(day)
                        const holidayName = getHolidayName(format(day, 'yyyy-MM-dd'))
                        const isRed = isRedDay(day)
                        const isTodayDate = isToday(day)

                        const isCurrentMonth = isSameMonth(day, currentDate)

                        if (viewMode === 'month' && !isCurrentMonth) {
                            return (
                                <div
                                    key={day.toString() + viewMode}
                                    className="min-h-[160px] md:min-h-[180px]"
                                />
                            )
                        }

                        return (
                            <motion.div
                                key={day.toString() + viewMode}
                                ref={isTodayDate ? todayRef : null}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: index * 0.02 }}
                                onClick={() => handleDateClick(day)}
                                className={`
                  relative p-4 md:p-5 rounded-2xl cursor-pointer group transition-all duration-300 border
                  ${isTodayDate ? 'bg-gray-900 text-white border-gray-900 shadow-xl ring-4 ring-blue-100' : 'bg-white hover:shadow-xl hover:-translate-y-1 border-gray-100'}
                  ${viewMode === 'day' ? 'min-h-[300px]' : 'min-h-[160px] md:min-h-[180px]'}
                  flex flex-col justify-between
                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className={`text-2xl md:text-3xl font-bold ${isRed && !isTodayDate ? 'text-red-500' : ''}`}>
                                            {format(day, 'd')}
                                        </span>
                                        <span className={`text-xs md:text-sm font-medium mt-1 ${isTodayDate ? 'text-gray-400' : isRed ? 'text-red-400' : 'text-gray-400'}`}>
                                            {format(day, 'EEEE', { locale: ko })}
                                        </span>
                                        {holidayName && (
                                            <span className="text-xs font-medium text-red-500 mt-1">{holidayName}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5 mt-4">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={`
                        px-2 py-1.5 md:px-3 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2
                        ${isTodayDate
                                                    ? 'bg-white/10 text-white backdrop-blur-sm'
                                                    : `${EVENT_STYLES[event.type].bg} ${EVENT_STYLES[event.type].text}`
                                                }
                      `}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${isTodayDate ? 'bg-white' : 'bg-current'}`} />
                                            <span className="truncate">{event.title}</span>
                                        </div>
                                    ))}
                                    {dayEvents.length === 0 && (
                                        <div className={`text-xs md:text-sm ${isTodayDate ? 'text-gray-500' : 'text-gray-300'} font-medium`}>
                                            일정 없음
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Floating Action Button (FAB) */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    setSelectedDate(new Date())
                    setIsModalOpen(true)
                }}
                className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 z-50 flex items-center justify-center"
            >
                <Plus size={28} />
            </motion.button>

            {isModalOpen && selectedDate && (
                <EventModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedDate={selectedDate}
                    onSave={() => {
                        fetchEvents()
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}
