"use client"

import { useState } from "react"
import { ExecutorSidebar } from "@/components/executor/sidebar"
import { AvailableOrders } from "@/components/executor/available-orders"
import { MyOrders } from "@/components/executor/my-orders"
import { OrderDetail } from "@/components/executor/order-detail"
import { ActiveOrderDetail } from "@/components/executor/active-order-detail"

export type ExecutorView = "available" | "my-orders" | "order-detail" | "active-detail"

export type OrderStatus = "available" | "in_progress" | "awaiting_payment" | "completed"

export interface AvailableOrder {
  id: string
  title: string
  clientName: string
  clientRating: number
  budget: string
  deadline: string
  createdAt: string
  articlesCount: number
  description: string
  responsesCount: number
  articles: Article[]
}

export interface MyOrder {
  id: string
  title: string
  clientName: string
  status: OrderStatus
  price: string
  deadline: string
  startedAt: string
  completedAt?: string
  articlesCount: number
  articles: Article[]
}

export interface Article {
  sku: string
  name: string
  quantity: number
  packagingType: string
}

const mockAvailableOrders: AvailableOrder[] = [
  {
    id: "1",
    title: "Упаковка партии косметики",
    clientName: "BeautyStore",
    clientRating: 4.7,
    budget: "50 000 ₽",
    deadline: "2024-12-15",
    createdAt: "2024-12-01T10:00:00",
    articlesCount: 45,
    description:
      "Требуется упаковать партию косметической продукции для отправки на маркетплейсы. Желательно использование экологичных материалов.",
    responsesCount: 2,
    articles: [
      { sku: "CRM-001", name: "Крем для лица", quantity: 500, packagingType: "Коробка" },
      { sku: "SER-002", name: "Сыворотка", quantity: 300, packagingType: "Пакет" },
      { sku: "MSK-003", name: "Маска тканевая", quantity: 200, packagingType: "Пакет" },
    ],
  },
  {
    id: "2",
    title: "Подарочная упаковка к НГ",
    clientName: "GiftShop",
    clientRating: 4.9,
    budget: "75 000 ₽",
    deadline: "2024-12-20",
    createdAt: "2024-12-02T14:30:00",
    articlesCount: 120,
    description:
      "Праздничная подарочная упаковка. Нужны ленты, банты, тематическое оформление. Товары разных размеров.",
    responsesCount: 5,
    articles: [
      { sku: "GFT-001", name: "Подарочный набор S", quantity: 300, packagingType: "Подарочная коробка" },
      { sku: "GFT-002", name: "Подарочный набор M", quantity: 250, packagingType: "Подарочная коробка" },
      { sku: "GFT-003", name: "Подарочный набор L", quantity: 150, packagingType: "Подарочная коробка" },
    ],
  },
  {
    id: "3",
    title: "Упаковка электроники",
    clientName: "TechWorld",
    clientRating: 4.5,
    budget: "35 000 ₽",
    deadline: "2024-12-18",
    createdAt: "2024-12-03T09:15:00",
    articlesCount: 30,
    description:
      "Хрупкая электроника, требуется пузырчатая плёнка и защитные вставки. Все товары должны быть промаркированы.",
    responsesCount: 1,
    articles: [
      { sku: "ELC-001", name: "Наушники беспроводные", quantity: 200, packagingType: "Коробка с защитой" },
      { sku: "ELC-002", name: "Портативная колонка", quantity: 150, packagingType: "Коробка с защитой" },
    ],
  },
]

const mockMyOrders: MyOrder[] = [
  {
    id: "101",
    title: "Сезонная упаковка одежды",
    clientName: "FashionHub",
    status: "in_progress",
    price: "42 000 ₽",
    deadline: "2024-12-10",
    startedAt: "2024-11-28",
    articlesCount: 85,
    articles: [
      { sku: "CLT-001", name: "Футболка базовая", quantity: 400, packagingType: "Пакет" },
      { sku: "CLT-002", name: "Джинсы", quantity: 200, packagingType: "Пакет" },
      { sku: "CLT-003", name: "Куртка", quantity: 100, packagingType: "Коробка" },
    ],
  },
  {
    id: "102",
    title: "Упаковка аксессуаров",
    clientName: "AccessoryWorld",
    status: "awaiting_payment",
    price: "28 000 ₽",
    deadline: "2024-12-14",
    startedAt: "2024-12-01",
    articlesCount: 60,
    articles: [
      { sku: "ACC-001", name: "Ремень кожаный", quantity: 150, packagingType: "Пакет" },
      { sku: "ACC-002", name: "Кошелёк", quantity: 200, packagingType: "Коробка" },
    ],
  },
  {
    id: "103",
    title: "Упаковка игрушек",
    clientName: "ToyLand",
    status: "completed",
    price: "55 000 ₽",
    deadline: "2024-11-25",
    startedAt: "2024-11-10",
    completedAt: "2024-11-24",
    articlesCount: 150,
    articles: [
      { sku: "TOY-001", name: "Конструктор", quantity: 300, packagingType: "Коробка" },
      { sku: "TOY-002", name: "Мягкая игрушка", quantity: 400, packagingType: "Пакет" },
    ],
  },
  {
    id: "104",
    title: "Упаковка канцтоваров",
    clientName: "OfficeSupply",
    status: "completed",
    price: "18 000 ₽",
    deadline: "2024-11-15",
    startedAt: "2024-11-05",
    completedAt: "2024-11-14",
    articlesCount: 40,
    articles: [{ sku: "OFC-001", name: "Ежедневник", quantity: 500, packagingType: "Плёнка" }],
  },
]

export default function ExecutorDashboard() {
  const [currentView, setCurrentView] = useState<ExecutorView>("available")
  const [selectedOrder, setSelectedOrder] = useState<AvailableOrder | null>(null)
  const [selectedMyOrder, setSelectedMyOrder] = useState<MyOrder | null>(null)

  const handleSelectOrder = (order: AvailableOrder) => {
    setSelectedOrder(order)
    setCurrentView("order-detail")
  }

  const handleSelectMyOrder = (order: MyOrder) => {
    setSelectedMyOrder(order)
    setCurrentView("active-detail")
  }

  const handleBack = () => {
    if (currentView === "order-detail") {
      setCurrentView("available")
      setSelectedOrder(null)
    } else if (currentView === "active-detail") {
      setCurrentView("my-orders")
      setSelectedMyOrder(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ExecutorSidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view)
          setSelectedOrder(null)
          setSelectedMyOrder(null)
        }}
      />

      <main className="flex-1 overflow-auto">
        {currentView === "available" && <AvailableOrders orders={mockAvailableOrders} onSelect={handleSelectOrder} />}
        {currentView === "my-orders" && <MyOrders orders={mockMyOrders} onSelect={handleSelectMyOrder} />}
        {currentView === "order-detail" && selectedOrder && <OrderDetail order={selectedOrder} onBack={handleBack} />}
        {currentView === "active-detail" && selectedMyOrder && (
          <ActiveOrderDetail order={selectedMyOrder} onBack={handleBack} />
        )}
      </main>
    </div>
  )
}
