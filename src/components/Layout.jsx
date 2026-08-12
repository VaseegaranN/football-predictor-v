import { NavLink, Outlet } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import { usePredictions } from '@/hooks/PredictionsProvider'
import { cn } from '@/lib/utils'

function NavBarItem({ to, end = false, children }) {
  return (
    <Button
      variant="ghost"
      nativeButton={false}
      className="hover:bg-black/50 hover:text-neutral-50"
      render={({ className, ...props }) => (
        <NavLink
          to={to}
          end={end}
          {...props}
          className={({ isActive }) =>
            cn(className, isActive && 'bg-primary text-primary-foreground')
          }
        >
          {children}
        </NavLink>
      )}
    >
      {children}
    </Button>
  )
}

function NavBar() {
  const { predictions } = usePredictions()

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-1 px-4">
        <span className="font-semibold tracking-tight">FIFA PE Engine</span>
        <span className="flex items-center gap-1">
          <NavBarItem to="/" end>
            Matches
          </NavBarItem>
          <NavBarItem to="/teams">Teams</NavBarItem>
          <NavBarItem to="/my-predictions">
            My Predictions
            {predictions.length > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-semibold text-white">
                {predictions.length}
              </span>
            )}
          </NavBarItem>
        </span>
        <ThemeToggle />
      </nav>
    </header>
  )
}

function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
