import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import { routeArray } from '@/config/routes'

const Layout = () => {
  const location = useLocation()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-surface border-b border-sage-200 px-6 flex items-center justify-between z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-moss-800 rounded-full flex items-center justify-center">
            <ApperIcon name="Flower2" className="w-4 h-4 text-surface" />
          </div>
          <h1 className="text-xl font-display text-moss-800">ZenScape</h1>
        </div>
        
        <div className="hidden md:flex text-sm text-sage-600">
          Find peace through creation
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <nav className="hidden md:flex w-64 bg-surface border-r border-sage-200 flex-col py-6 z-40">
          <div className="px-6 mb-8">
            <p className="text-sm text-sage-600 font-medium">Create • Meditate • Reflect</p>
          </div>
          
          <div className="flex-1 px-3">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 mb-2 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-moss-100 text-moss-800 shadow-sm'
                      : 'text-sage-600 hover:bg-sage-50 hover:text-moss-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <ApperIcon
                      name={route.icon}
                      className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                        isActive ? 'text-moss-700' : 'group-hover:scale-110'
                      }`}
                    />
                    <span className="font-medium">{route.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-accent rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-sage-200">
            <div className="flex items-center text-sm text-sage-500">
              <ApperIcon name="Sparkles" className="w-4 h-4 mr-2" />
              <span>Mindful moments</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden flex-shrink-0 bg-surface border-t border-sage-200 px-2 py-2 z-50">
        <div className="flex justify-around">
          {routeArray.map((route) => (
            <NavLink
              key={route.id}
              to={route.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 min-w-0 ${
                  isActive
                    ? 'text-moss-800 bg-moss-50'
                    : 'text-sage-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ApperIcon
                    name={route.icon}
                    className={`w-5 h-5 mb-1 transition-transform duration-200 ${
                      isActive ? 'scale-110' : ''
                    }`}
                  />
                  <span className="text-xs font-medium truncate">{route.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default Layout