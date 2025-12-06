"use client"

import { Plus, Package, Clock, MessageSquare, ChevronRight, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PackagingItem, PackagingStatus } from "@/app/page"

interface PackagingListProps {
  packagings: PackagingItem[]
  onSelect: (packaging: PackagingItem) => void
  onCreate: () => void
}

const statusConfig: Record<PackagingStatus, { label: string; className: string }> = {
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground" },
  active: { label: "Активно", className: "bg-primary/20 text-primary" },
  in_progress: { label: "В работе", className: "bg-accent/20 text-accent" },
  completed: { label: "Завершено", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Отменено", className: "bg-destructive/20 text-destructive" },
}

export function PackagingList({ packagings, onSelect, onCreate }: PackagingListProps) {
  const activePackagings = packagings.filter((p) => ["active", "in_progress", "draft"].includes(p.status))
  const archivedPackagings = packagings.filter((p) => ["completed", "cancelled"].includes(p.status))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Мои упаковки</h1>
          <p className="text-muted-foreground mt-1">Управляйте заданиями на упаковку товаров</p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Создать задание
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Поиск по названию..." className="pl-10 bg-secondary border-border" />
        </div>
        <Button variant="outline" size="icon" className="border-border bg-transparent">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {activePackagings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Активные задания</h2>
          <div className="space-y-3">
            {activePackagings.map((packaging) => (
              <PackagingCard key={packaging.id} packaging={packaging} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}

      {activePackagings.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-12 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Нет активных заданий</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Создайте новое задание на упаковку, чтобы получить отклики исполнителей
          </p>
          <Button onClick={onCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Создать первое задание
          </Button>
        </div>
      )}

      {archivedPackagings.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">История</h2>
          <div className="space-y-3">
            {archivedPackagings.map((packaging) => (
              <PackagingCard key={packaging.id} packaging={packaging} onSelect={onSelect} isArchived />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function PackagingCard({
  packaging,
  onSelect,
  isArchived = false,
}: {
  packaging: PackagingItem
  onSelect: (packaging: PackagingItem) => void
  isArchived?: boolean
}) {
  const status = statusConfig[packaging.status]

  return (
    <button
      onClick={() => onSelect(packaging)}
      className={cn(
        "w-full text-left bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group",
        isArchived && "opacity-70 hover:opacity-100",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {packaging.title}
            </h3>
            <Badge className={cn("text-xs", status.className)}>{status.label}</Badge>
            {packaging.unreadMessages > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                {packaging.unreadMessages} новых
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              {packaging.articlesCount} артикулов
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              до {new Date(packaging.deadline).toLocaleDateString("ru-RU")}
            </span>
            {packaging.responsesCount > 0 && (
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                {packaging.responsesCount} откликов
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-foreground">{packaging.budget}</p>
            <p className="text-xs text-muted-foreground">бюджет</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </button>
  )
}
