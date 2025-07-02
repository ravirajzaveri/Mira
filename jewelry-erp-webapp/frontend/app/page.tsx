'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Package, Users, TrendingUp, Clock } from 'lucide-react'

const dashboardData = [
  { name: 'Mon', issues: 12, receipts: 8 },
  { name: 'Tue', issues: 19, receipts: 15 },
  { name: 'Wed', issues: 15, receipts: 12 },
  { name: 'Thu', issues: 22, receipts: 18 },
  { name: 'Fri', issues: 18, receipts: 20 },
  { name: 'Sat', issues: 25, receipts: 22 },
  { name: 'Sun', issues: 8, receipts: 6 },
]

const stats = [
  { name: 'Total Issues', value: '248', icon: Package, color: 'bg-blue-500' },
  { name: 'Total Receipts', value: '189', icon: TrendingUp, color: 'bg-green-500' },
  { name: 'Active Karigars', value: '12', icon: Users, color: 'bg-purple-500' },
  { name: 'Pending Items', value: '59', icon: Clock, color: 'bg-orange-500' },
]

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Jewelry ERP Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="issues" fill="#3b82f6" name="Issues" />
              <Bar dataKey="receipts" fill="#10b981" name="Receipts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Issues</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">ISS-20250102-00{item}</p>
                  <p className="text-sm text-gray-600">Ramesh Kumar - Casting</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Receipts</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">RCP-20250102-00{item}</p>
                  <p className="text-sm text-gray-600">Suresh Patel - Polishing</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}