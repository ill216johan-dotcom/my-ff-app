"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PackagingList } from "@/components/packaging-list"
import { CreatePackaging } from "@/components/create-packaging"
import { PackagingDetail } from "@/components/packaging-detail"

export type ViewType = "list" | "create" | "detail"

export type PackagingStatus = "draft" | "active" | "in_progress" | "completed" | "cancelled"

export interface PackagingItem {
  id: string
  title: string
  status: PackagingStatus
  createdAt: string
  deadline: string
  budget: string
  articlesCount: number
  responsesCount: number
  unreadMessages: number
}

export interface Response {
  id: string
  executorName: string
  executorRating: number
  price: string
  deadline: string
  message: string
  createdAt: string
  hasChat: boolean
  unreadCount: number
}

const mockPackagings: PackagingItem[] = [
  {
    id: "1",
    title: "Упаковка партии косметики",
    status: "active",
    createdAt: "2024-12-01",
    deadline: "2024-12-15",
    budget: "50 000 ₽",
    articlesCount: 45,
    responsesCount: 3,
    unreadMessages: 2,
  },
  {
    id: "2",
    title: "Подарочная упаковка к НГ",
    status: "in_progress",
    createdAt: "2024-11-20",
    deadline: "2024-12-10",
    budget: "35 000 ₽",
    articlesCount: 120,
    responsesCount: 5,
    unreadMessages: 0,
  },
  {
    id: "3",
    title: "Упаковка электроники",
    status: "completed",
    createdAt: "2024-10-15",
    deadline: "2024-10-30",
    budget: "28 000 ₽",
    articlesCount: 30,
    responsesCount: 4,
    unreadMessages: 0,
  },
  {
    id: "4",
    title: "Сезонная упаковка одежды",
    status: "completed",
    createdAt: "2024-09-01",
    deadline: "2024-09-20",
    budget: "42 000 ₽",
    articlesCount: 85,
    responsesCount: 6,
    unreadMessages: 0,
  },
]

export default function PackagingExchange() {
  const [currentView, setCurrentView] = useState<ViewType>("list")
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingItem | null>(null)

  const handleSelectPackaging = (packaging: PackagingItem) => {
    setSelectedPackaging(packaging)
    setCurrentView("detail")
  }

  const handleBack = () => {
    setCurrentView("list")
    setSelectedPackaging(null)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1 overflow-auto">
        {currentView === "list" && (
          <PackagingList
            packagings={mockPackagings}
            onSelect={handleSelectPackaging}
            onCreate={() => setCurrentView("create")}
          />
        )}
        {currentView === "create" && <CreatePackaging onBack={handleBack} />}
        {currentView === "detail" && selectedPackaging && (
          <PackagingDetail packaging={selectedPackaging} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}
