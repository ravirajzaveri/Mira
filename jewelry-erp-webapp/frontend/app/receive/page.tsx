'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface ReceiptForm {
  receiptNo: string
  date: string
  issueId: string
  pieces: number
  grossWeight: number
  stoneWeight: number
  wastageWeight: number
  remarks: string
}

const pendingIssues = [
  {
    id: '1',
    issueNo: 'ISS-20250102-001',
    karigar: 'Ramesh Kumar',
    process: 'Casting',
    issuedWeight: 25.5,
    receivedWeight: 0,
    balance: 25.5,
    pieces: 2
  },
  {
    id: '2',
    issueNo: 'ISS-20250102-002',
    karigar: 'Suresh Patel',
    process: 'Filing',
    issuedWeight: 18.3,
    receivedWeight: 10.2,
    balance: 8.1,
    pieces: 1
  },
]

const recentReceipts = [
  {
    id: '1',
    receiptNo: 'RCP-20250102-001',
    date: '2025-01-02',
    issueNo: 'ISS-20250101-003',
    karigar: 'Mahesh Shah',
    grossWeight: 22.1,
    netWeight: 20.5,
    wastage: 1.2
  },
  {
    id: '2',
    receiptNo: 'RCP-20250102-002',
    date: '2025-01-02',
    issueNo: 'ISS-20250101-004',
    karigar: 'Dinesh Verma',
    grossWeight: 15.8,
    netWeight: 14.9,
    wastage: 0.6
  },
]

export default function ReceivePage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ReceiptForm>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      pieces: 0,
      grossWeight: 0,
      stoneWeight: 0,
      wastageWeight: 0,
    }
  })

  const grossWeight = watch('grossWeight')
  const stoneWeight = watch('stoneWeight')
  const wastageWeight = watch('wastageWeight')
  const netWeight = grossWeight - stoneWeight - wastageWeight

  const generateReceiptNo = () => {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    setValue('receiptNo', `RCP-${dateStr}-${randomNum}`)
  }

  const onSubmit = async (data: ReceiptForm) => {
    try {
      // API call would go here
      console.log('Receipt data:', { ...data, netWeight })
      toast.success('Receipt created successfully!')
      reset()
      setSelectedIssue(null)
      setIsFormOpen(false)
    } catch (error) {
      toast.error('Failed to create receipt')
    }
  }

  const handleIssueSelect = (issue: any) => {
    setSelectedIssue(issue)
    setValue('issueId', issue.id)
    setValue('pieces', issue.pieces - (issue.receivedPieces || 0))
  }

  const filteredReceipts = recentReceipts.filter(receipt => 
    receipt.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.karigar.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receive Management</h1>
          <p className="text-gray-600">Record receipts against issued materials</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5" />
          New Receipt
        </button>
      </div>

      {/* Pending Issues */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Issues</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Karigar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Process
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {issue.issueNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.karigar}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.process}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.issuedWeight}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.receivedWeight}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                    {issue.balance}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        handleIssueSelect(issue)
                        setIsFormOpen(true)
                      }}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                    >
                      Receive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search receipts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Receipts</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Karigar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gross Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wastage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReceipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {receipt.receiptNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {receipt.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {receipt.issueNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {receipt.karigar}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {receipt.grossWeight}g
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {receipt.netWeight}g
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {receipt.wastage}g
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Receipt</h3>
                <button
                  onClick={() => {
                    setIsFormOpen(false)
                    setSelectedIssue(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {selectedIssue && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900">Selected Issue Details</h4>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-blue-700">Issue No:</span> {selectedIssue.issueNo}
                    </div>
                    <div>
                      <span className="text-blue-700">Karigar:</span> {selectedIssue.karigar}
                    </div>
                    <div>
                      <span className="text-blue-700">Process:</span> {selectedIssue.process}
                    </div>
                    <div>
                      <span className="text-blue-700">Balance:</span> {selectedIssue.balance}g
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Receipt No
                    </label>
                    <div className="flex">
                      <input
                        {...register('receiptNo', { required: 'Receipt number is required' })}
                        className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="RCP-YYYYMMDD-XXX"
                      />
                      <button
                        type="button"
                        onClick={generateReceiptNo}
                        className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-3 py-2 text-sm hover:bg-gray-200"
                      >
                        Generate
                      </button>
                    </div>
                    {errors.receiptNo && (
                      <p className="text-red-500 text-sm mt-1">{errors.receiptNo.message}</p>
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

                <div className="grid grid-cols-4 gap-4">
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
                      Wastage (g)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      {...register('wastageWeight', { min: 0 })}
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

                {selectedIssue && netWeight > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm">
                      <span className="font-medium">Balance Check: </span>
                      {netWeight > selectedIssue.balance ? (
                        <span className="text-red-600">
                          Exceeds balance by {(netWeight - selectedIssue.balance).toFixed(3)}g
                        </span>
                      ) : (
                        <span className="text-green-600">
                          Within limits. Remaining: {(selectedIssue.balance - netWeight).toFixed(3)}g
                        </span>
                      )}
                    </div>
                  </div>
                )}

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
                    onClick={() => {
                      setIsFormOpen(false)
                      setSelectedIssue(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Create Receipt
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