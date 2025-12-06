"use client"

import { useState } from "react"
import { ManagerSidebar } from "@/components/manager/sidebar"
import { AllOrders } from "@/components/manager/all-orders"
import { CompletedOrders } from "@/components/manager/completed-orders"
import { ArbitrationList } from "@/components/manager/arbitration-list"
import { PriceEstimation } from "@/components/manager/price-estimation"
import { ManagerOrderDetail } from "@/components/manager/order-detail"

export type ManagerView = "all-orders" | "completed" | "arbitration" | "estimation" | "order-detail"

export type OrderStatus = "active" | "in_progress" | "awaiting_payment" | "completed"

export interface ManagerOrder {
  id: string
  title: string
  clientName: string
  clientId: string
  executorName?: string
  executorId?: string
  status: OrderStatus
  budget: string
  price?: string
  deadline: string
  createdAt: string
  articlesCount: number
  unreadMessages: number
  hasArbitration: boolean
  arbitrationRequestedBy?: "client" | "executor"
  arbitrationRequestedAt?: string
  isEstimation?: boolean
  invoiceSentAt?: string
}

export interface Article {
  sku: string
  name: string
  quantity: number
  packagingType: string
}

const mockAllOrders: ManagerOrder[] = [
  {
    id: "1",
    title: "Упаковка партии косметики",
    clientName: "BeautyStore",
    clientId: "c1",
    status: "active",
    budget: "50 000 ₽",
    deadline: "2024-12-15",
    createdAt: "2024-12-01",
    articlesCount: 45,
    unreadMessages: 2,
    hasArbitration: false,
  },
  {
    id: "2",
    title: "Подарочная упаковка к НГ",
    clientName: "GiftShop",
    clientId: "c2",
    executorName: "Мария Упакова",
    executorId: "e1",
    status: "in_progress",
    budget: "75 000 ₽",
    price: "68 000 ₽",
    deadline: "2024-12-10",
    createdAt: "2024-11-20",
    articlesCount: 120,
    unreadMessages: 5,
    hasArbitration: false,
  },
  {
    id: "3",
    title: "Упаковка электроники",
    clientName: "TechWorld",
    clientId: "c3",
    executorName: "Анна Сервис",
    executorId: "e2",
    status: "awaiting_payment",
    budget: "35 000 ₽",
    price: "32 000 ₽",
    deadline: "2024-12-05",
    createdAt: "2024-11-25",
    articlesCount: 30,
    unreadMessages: 0,
    hasArbitration: true,
    arbitrationRequestedBy: "executor",
    arbitrationRequestedAt: "2024-12-07T10:00:00",
    invoiceSentAt: "2024-12-05T18:00:00",
  },
  {
    id: "4",
    title: "Сезонная упаковка одежды",
    clientName: "FashionHub",
    clientId: "c4",
    executorName: "Елена Пак",
    executorId: "e3",
    status: "in_progress",
    budget: "42 000 ₽",
    price: "40 000 ₽",
    deadline: "2024-12-03",
    createdAt: "2024-11-15",
    articlesCount: 85,
    unreadMessages: 3,
    hasArbitration: true,
    arbitrationRequestedBy: "client",
    arbitrationRequestedAt: "2024-12-05T14:00:00",
  },
]

const mockCompletedOrders: ManagerOrder[] = [
  {
    id: "101",
    title: "Упаковка игрушек",
    clientName: "ToyLand",
    clientId: "c5",
    executorName: "Ольга Мастер",
    executorId: "e4",
    status: "completed",
    budget: "55 000 ₽",
    price: "52 000 ₽",
    deadline: "2024-11-25",
    createdAt: "2024-11-10",
    articlesCount: 150,
    unreadMessages: 0,
    hasArbitration: false,
  },
  {
    id: "102",
    title: "Упаковка канцтоваров",
    clientName: "OfficeSupply",
    clientId: "c6",
    executorName: "Мария Упакова",
    executorId: "e1",
    status: "completed",
    budget: "18 000 ₽",
    price: "17 500 ₽",
    deadline: "2024-11-15",
    createdAt: "2024-11-05",
    articlesCount: 40,
    unreadMessages: 0,
    hasArbitration: false,
  },
]

const mockEstimations: ManagerOrder[] = [
  {
    id: "est-1",
    title: "Оценка: Партия БАДов",
    clientName: "Потенциальный клиент",
    clientId: "prospect-1",
    status: "active",
    budget: "~100 000 ₽",
    deadline: "2024-12-20",
    createdAt: "2024-12-05",
    articlesCount: 200,
    unreadMessages: 4,
    hasArbitration: false,
    isEstimation: true,
  },
]

export default function ManagerDashboard() {
  const [currentView, setCurrentView] = useState<ManagerView>("all-orders")
  const [selectedOrder, setSelectedOrder] = useState<ManagerOrder | null>(null)

  const handleSelectOrder = (order: ManagerOrder) => {
    setSelectedOrder(order)
    setCurrentView("order-detail")
  }

  const handleBack = () => {
    setCurrentView("all-orders")
    setSelectedOrder(null)
  }

  const arbitrationOrders = mockAllOrders.filter((o) => o.hasArbitration)
  const totalArbitration = arbitrationOrders.length
  const totalUnread = [...mockAllOrders, ...mockEstimations].reduce((sum, o) => sum + o.unreadMessages, 0)

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view)
          setSelectedOrder(null)
        }}
        arbitrationCount={totalArbitration}
        unreadCount={totalUnread}
      />

      <main className="flex-1 overflow-auto">
        {currentView === "all-orders" && <AllOrders orders={mockAllOrders} onSelect={handleSelectOrder} />}
        {currentView === "completed" && <CompletedOrders orders={mockCompletedOrders} onSelect={handleSelectOrder} />}
        {currentView === "arbitration" && <ArbitrationList orders={arbitrationOrders} onSelect={handleSelectOrder} />}
        {currentView === "estimation" && <PriceEstimation estimations={mockEstimations} onSelect={handleSelectOrder} />}
        {currentView === "order-detail" && selectedOrder && (
          <ManagerOrderDetail order={selectedOrder} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}
