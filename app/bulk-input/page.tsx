'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Plus, Trash2, Save } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/utils/supabase/client'

type BulkEvent = {
    id: number
    title: string
    date: string
    type: string
    description?: string
    memo?: string
}

export default function BulkInputPage() {
    const [events, setEvents] = useState<BulkEvent[]>([
        { id: 1, title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'payroll' }
    ])
    const [loading, setLoading] = useState(false)

    const addRow = () => {
        setEvents([...events, { id: Date.now(), title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'other' }])
    }

    const removeRow = (id: number) => {
        setEvents(events.filter(e => e.id !== id))
    }

    const updateEvent = (id: number, field: keyof BulkEvent, value: string) => {
        setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const eventsToInsert = events.map(row => ({
                title: row.title,
                description: row.description || '',
                event_date: row.date,
                type: row.type,
                memo: row.memo || ''
            })).filter(e => e.title.trim() !== '') // Filter out empty titles

            if (eventsToInsert.length === 0) {
                alert('저장할 일정이 없습니다. 제목을 입력해주세요.')
                setLoading(false)
                return
            }

            const { error } = await supabase
                .from('events')
                .insert(eventsToInsert)

            if (error) throw error

            alert('저장이 완료되었습니다.')
            setEvents([{ id: Date.now(), title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'payroll' }])
        } catch (error) {
            console.error('Error saving events:', error)
            alert('저장 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Upload className="text-blue-600" />
                    일괄 입력
                </h1>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Save size={18} />
                    {loading ? '저장 중...' : '저장하기'}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 font-medium text-gray-500 text-sm">
                    <div className="col-span-4">날짜</div>
                    <div className="col-span-4">제목</div>
                    <div className="col-span-3">유형</div>
                    <div className="col-span-1 text-center">삭제</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-12 gap-4 p-4 items-center"
                        >
                            <div className="col-span-4">
                                <input
                                    type="date"
                                    value={event.date}
                                    onChange={e => updateEvent(event.id, 'date', e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={event.title}
                                    placeholder="일정 제목"
                                    onChange={e => updateEvent(event.id, 'title', e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="col-span-3">
                                <select
                                    value={event.type}
                                    onChange={e => updateEvent(event.id, 'type', e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="payroll">🟢 급여지급</option>
                                    <option value="settlement">🟠 정산마감</option>
                                    <option value="onboarding">🔵 입사</option>
                                    <option value="resignation">⚫ 퇴사</option>
                                    <option value="vacation">🟣 단체연차</option>
                                    <option value="education">🟡 교육</option>
                                    <option value="notice">📢 공지</option>
                                    <option value="other">⚪ 기타</option>
                                </select>
                            </div>
                            <div className="col-span-1 flex justify-center">
                                <button
                                    onClick={() => removeRow(event.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={addRow}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <Plus size={20} />
                        행 추가하기
                    </button>
                </div>
            </div>
        </div>
    )
}
