'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface IssueForm {
  issueNo: string
  date: string
  karigarId: string
  processId: string
  designId: string
  pieces: number
  grossWeight: number
  stoneWeight: number
  remarks: string
}

const karigars = [
  { id: '1', code: 'K001', name: 'Ramesh Kumar' },
  { id: '2', code: 'K002', name: 'Suresh Patel' },
  { id: '3', code: 'K003', name: 'Mahesh Shah' },
  { id: '4', code: 'K004', name: 'Dinesh Verma' },
]

const processes = [
  { id: '1', name: 'Casting' },
  { id: '2', name: 'Filing' },
  { id: '3', name: 'Polishing' },
  { id: '4', name: 'Stone Setting' },
]

const designs = [
  { id: '1', code: 'D001', name: 'Traditional Ring' },
  { id: '2', code: 'D002', name: 'Modern Pendant' },
  { id: '3', code: 'D003', name: 'Classic Earrings' },
]

const recentIssues = [
  {
    id: '1',
    issueNo: 'ISS-20250102-001',
    date: '2025-01-02',
    karigar: 'Ramesh Kumar',
    process: 'Casting',
    grossWeight: 25.5,
    netWeight: 23.2,
    status: 'Pending'
  },
  {
    id: '2',
    issueNo: 'ISS-20250102-002',
    date: '2025-01-02',
    karigar: 'Suresh Patel',
    process: 'Filing',
    grossWeight: 18.3,
    netWeight: 16.8,
    status: 'Partial'
  },
]

export default function IssuePage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<IssueForm>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      pieces: 1,
      grossWeight: 0,
      stoneWeight: 0,
    }
  })

  const grossWeight = watch('grossWeight')
  const stoneWeight = watch('stoneWeight')
  const netWeight = grossWeight - stoneWeight

  const generateIssueNo = () => {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    setValue('issueNo', `ISS-${dateStr}-${randomNum}`)
  }

  const onSubmit = async (data: IssueForm) => {
    try {
      // API call would go here
      console.log('Issue data:', { ...data, netWeight })
      toast.success('Issue created successfully!')
      reset()
      setIsFormOpen(false)
    } catch (error) {
      toast.error('Failed to create issue')
    }
  }

  const filteredIssues = recentIssues.filter(issue => 
    issue.issueNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.karigar.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue Management</h1>
          <p className="text-gray-600">Create and manage material issues to karigars</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          New Issue
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Karigar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Process
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gross Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIssues.map((issue) => (
              <tr key={issue.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {issue.issueNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {issue.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {issue.karigar}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {issue.process}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {issue.grossWeight}g
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {issue.netWeight}g
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    issue.status === 'Partial' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Issue</h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue No
                    </label>
                    <div className="flex">
                      <input
                        {...register('issueNo', { required: 'Issue number is required' })}
                        className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ISS-YYYYMMDD-XXX"
                      />
                      <button
                        type="button"
                        onClick={generateIssueNo}
                        className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-sm hover:bg-gray-200"
                      >
                        Generate
                      </button>
                    </div>
                    {errors.issueNo && (
                      <p className="text-red-500 text-sm mt-1">{errors.issueNo.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Karigar
                    </label>
                    <select
                      {...register('karigarId', { required: 'Karigar is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Karigar</option>
                      {karigars.map((karigar) => (
                        <option key={karigar.id} value={karigar.id}>
                          {karigar.code} - {karigar.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Process
                    </label>
                    <select
                      {...register('processId', { required: 'Process is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Process</option>
                      {processes.map((process) => (
                        <option key={process.id} value={process.id}>
                          {process.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Design
                    </label>
                    <select
                      {...register('designId')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Design</option>
                      {designs.map((design) => (
                        <option key={design.id} value={design.id}>
                          {design.code} - {design.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pieces
                    </label>
                    <input
                      type="number"
                      {...register('pieces', { required: 'Pieces is required', min: 1 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gross Weight (g)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      {...register('grossWeight', { required: 'Gross weight is required', min: 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stone Weight (g)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      {...register('stoneWeight', { min: 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Net Weight (g)
                    </label>
                    <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-700 font-medium">
                      {netWeight.toFixed(3)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    {...register('remarks')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter any remarks..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}