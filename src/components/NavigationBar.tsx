import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/lib/ui-utils'
import { Menu, X, Bell, Search, User, ChevronDown } from 'lucide-react'
import { useSidebar } from '@/contexts/sidebar-context'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom class name for the navigation bar */
  className?: string
  /** Whether to show the sidebar toggle button */
  showSidebarToggle?: boolean
  /** Custom logo component */
  logo?: React.ReactNode
  /** Custom user menu content */
  userMenuContent?: React.ReactNode
  /** Custom search component */
  searchComponent?: React.ReactNode
  /** Custom actions to display in the navigation bar */
  actions?: React.ReactNode
  /** Whether the navigation bar is fixed at the top */
  fixed?: boolean
  /** Custom height for the navigation bar */
  height?: number | string
  /** Background color for the navigation bar */
  bgColor?: string
  /** Text color for the navigation bar */
  textColor?: string
  /** Whether to show the search bar */
  showSearch?: boolean
  /** Whether to show the theme toggle */
  showThemeToggle?: boolean
  /** Whether to show the notifications button */
  showNotifications?: boolean
  /** Notification count */
  notificationCount?: number
  /** Callback when the search button is clicked */
  onSearchClick?: () => void
  /** Callback when the notifications button is clicked */
  onNotificationsClick?: () => void
  /** User profile data */
  user?: {
    name?: string
    email?: string
    image?: string
    role?: string
  }
}

/**
 * A responsive navigation bar component with support for mobile menu, search, and user menu.
 * Integrates with the sidebar and theme toggling.
 */
const NavigationBar = React.forwardRef<HTMLDivElement, NavigationBarProps>(
  ({
    className,
    showSidebarToggle = true,
    logo,
    userMenuContent,
    searchComponent,
    actions,
    fixed = true,
    height = '4rem',
    bgColor = 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md',
    textColor = 'text-gray-900 dark:text-white',
    showSearch = true,
    showThemeToggle = true,
    showNotifications = true,
    notificationCount = 0,
    onSearchClick,
    onNotificationsClick,
    user,
    ...props
  }, ref) => {
    const { isOpen, toggleSidebar } = useSidebar()
    const { theme, setTheme } = useTheme()
    const [isScrolled, setIsScrolled] = React.useState(false)

    // Handle scroll effect for navbar
    React.useEffect(() => {
      const handleScroll = () => {
        const scrolled = window.scrollY > 0
        if (scrolled !== isScrolled) {
          setIsScrolled(scrolled)
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }, [isScrolled])

    // Toggle dark/light theme
    const toggleTheme = () => {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    // Get user initials for avatar fallback
    const getUserInitials = (name?: string) => {
      if (!name) return 'U'
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }


    return (
      <header
        ref={ref}
        className={cn(
          'w-full border-b border-gray-200 dark:border-gray-800 transition-all duration-200 z-40',
          fixed && 'sticky top-0',
          isScrolled && 'shadow-sm',
          bgColor,
          textColor,
          className
        )}
        style={{
          '--nav-height': typeof height === 'number' ? `${height}px` : height,
        }}
        {...props}
      >
        <div className="container mx-auto px-4 h-[var(--nav-height)] flex items-center">
          {/* Left section */}
          <div className="flex items-center flex-shrink-0">
            {showSidebarToggle && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 -ml-2 md:hidden"
                onClick={toggleSidebar}
                aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            {logo || (
              <div className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Convert-IA
                </span>
              </div>
            )}
          </div>

          {/* Center section - Search */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            {searchComponent || (
              showSearch && (
                <Button
                  variant="outline"
                  className="w-full max-w-md justify-start text-muted-foreground"
                  onClick={onSearchClick}
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span>Search... (Ctrl+K)</span>
                  <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              )
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center ml-auto space-x-2">
            {actions}
            
            {showSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onSearchClick}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {showThemeToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            {showNotifications && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNotificationsClick}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {Math.min(notificationCount, 9)}
                      {notificationCount > 9 && '+'}
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={user.name || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300">
                        {getUserInitials(user?.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="ml-2 hidden md:inline-flex items-center">
                    <span className="mr-1 text-sm font-medium">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {userMenuContent || (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Sign out</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    )
  }
)

NavigationBar.displayName = 'NavigationBar'

export { NavigationBar }
