import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import type { Database } from "@/lib/types/database"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AppHeaderProps {
  profile: Profile
}

export function AppHeader({ profile }: AppHeaderProps) {
  const isClient = profile.user_type === "client"
  const isFreelancer = profile.user_type === "freelancer"
  const isAdmin = profile.user_type === "admin"

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-blue-600">aDocaWorks</h1>
          </Link>
          <nav className="flex gap-6">
            {isClient && (
              <>
                <Link href="/projects" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Meus Projetos
                </Link>
                <Link href="/projects/new" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Criar Projeto
                </Link>
                <Link href="/transactions" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Transações
                </Link>
              </>
            )}
            {isFreelancer && (
              <>
                <Link href="/projects" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Buscar Projetos
                </Link>
                <Link href="/proposals" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Minhas Propostas
                </Link>
                <Link href="/transactions" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Transações
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link href="/admin" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/admin/disputes" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Disputas
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/notifications">
            <NotificationBell />
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" type="submit">
              Sair
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
