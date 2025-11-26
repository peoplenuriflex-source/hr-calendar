'use client'

import { useState, useEffect } from 'react'
import { Database, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/utils/supabase/client'

type Event = {
    id: string
    title: string
    event_date: string
    type: string
    description: string | null
    memo: string | null
}

export default function DataViewPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('event_date', { ascending: false })

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

    const filteredEvents = events.filter(e =>
        e.title.includes(searchTerm) || e.type.includes(searchTerm)
    )

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'payroll': return '🟢 급여';
            case 'settlement': return '🟠 정산';
            case 'onboarding': return '🔵 입사';
            case 'resignation': return '⚫ 퇴사';
            case 'vacation': return '🟣 연차';
            case 'education': return '🟡 교육';
            case 'notice': return '📢 공지';
            default: return '⚪ 기타';
        }
    }

    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Database className="text-blue-600" />
                    데이터 조회
                </h1>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="검색어 입력..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-medium text-gray-500 text-sm">날짜</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">제목</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">유형</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">설명</th>
                                <th className="p-4 font-medium text-gray-500 text-sm">메모</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        데이터를 불러오는 중...
                                    </td>
                                </tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map(event => (
                                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-900">{event.event_date}</td>
                                        <td className="p-4 font-medium text-gray-900">{event.title}</td>
                                        <td className="p-4 text-sm">{getTypeLabel(event.type)}</td>
                                        <td className="p-4 text-gray-500 text-sm">{event.description || '-'}</td>
                                        <td className="p-4 text-gray-500 text-sm">{event.memo || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
