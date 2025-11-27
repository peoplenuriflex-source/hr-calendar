'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { X, AlignLeft, Trash2 } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { EventType, Event } from './CalendarView'

type Props = {
    isOpen: boolean
    onClose: () => void
    selectedDate: Date
    events: Event[]
    onSave: () => void
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
    { value: 'payroll', label: '🟢 급여지급' },
    { value: 'settlement', label: '🟠 급여 정산 마감' },
    { value: 'onboarding', label: '🔵 입사' },
    { value: 'resignation', label: '⚫ 퇴사' },
    { value: 'vacation', label: '🟣 단체연차' },
    { value: 'education', label: '🟡 법정의무교육' },
    { value: 'notice', label: '📢 공지' },
    { value: 'other', label: '⚪ 기타' },
]

export default function EventModal({ isOpen, onClose, selectedDate, events, onSave }: Props) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [memo, setMemo] = useState('')
    const [type, setType] = useState<EventType>('other')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('events')
                .insert([
                    {
                        title,
                        description,
                        memo,
                        type,
                        event_date: format(selectedDate, 'yyyy-MM-dd'),
                    },
                ])

            if (error) throw error

            onSave()
            onClose()
            // Reset form
            setTitle('')
            setDescription('')
            setMemo('')
            setType('other')
        } catch (error) {
            console.error('Error saving event:', error)
            alert('일정 저장 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }
    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id)

            if (error) throw error

            onSave() // Refresh events
        } catch (error) {
            console.error('Error deleting event:', error)
            alert('삭제 중 오류가 발생했습니다.')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="font-bold text-xl text-gray-900">일정 관리</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {events.length > 0 && (
                    <div className="px-6 pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">등록된 일정</h4>
                        <div className="space-y-2 mb-6">
                            {events.map(event => (
                                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-red-200 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-2 h-2 rounded-full shrink-0 bg-gray-900`} />
                                        <span className="font-medium text-sm text-gray-700 truncate">{event.title}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="h-px bg-gray-100" />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">날짜</label>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 font-medium">
                            {format(selectedDate, 'yyyy년 MM월 dd일')}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            placeholder="일정 제목 입력"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">유형</label>
                        <div className="grid grid-cols-2 gap-2">
                            {EVENT_TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setType(t.value)}
                                    className={`
                    p-2 text-sm font-medium rounded-lg border transition-all text-left
                    ${type === t.value
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                  `}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">설명</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            placeholder="간단한 설명"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <AlignLeft size={16} />
                            메모
                        </label>
                        <textarea
                            value={memo}
                            onChange={e => setMemo(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all h-24 resize-none"
                            placeholder="상세한 메모를 남기세요..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? '저장 중...' : '저장하기'}
                    </button>
                </form>
            </div>
        </div>
    )
}
