'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function NotificationPage() {
    // Mock notifications
    const notifications = [
        { id: 1, title: '급여일 알림', message: '오늘은 11월 급여일입니다.', type: 'info', date: new Date() },
        { id: 2, title: '서버 점검', message: '새벽 2시부터 4시까지 점검이 있습니다.', type: 'warning', date: new Date(Date.now() - 86400000) },
        { id: 3, title: '휴가 승인', message: '김철수님의 휴가가 승인되었습니다.', type: 'success', date: new Date(Date.now() - 172800000) },
    ]

    return (
        <div className="p-4 lg:p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Bell className="text-blue-600" />
                알림 센터
            </h1>

            <div className="space-y-4">
                {notifications.map((noti, index) => (
                    <motion.div
                        key={noti.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start"
                    >
                        <div className={`p-3 rounded-full shrink-0 ${noti.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                noti.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                    'bg-green-100 text-green-600'
                            }`}>
                            {noti.type === 'info' && <Info size={20} />}
                            {noti.type === 'warning' && <AlertCircle size={20} />}
                            {noti.type === 'success' && <CheckCircle size={20} />}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-900">{noti.title}</h3>
                                <span className="text-xs text-gray-400">
                                    {format(noti.date, 'M월 d일 a h:mm', { locale: ko })}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{noti.message}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
