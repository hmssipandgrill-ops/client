import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)
export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const s = io('/', {
      autoConnect: true,
      reconnectionAttempts: 5,       // stop after 5 tries
      reconnectionDelay: 3000,
      timeout: 5000,
      transports: ['websocket', 'polling'],
    })

    s.on('connect_error', () => {
      // silently fail — server may not be running yet
    })

    setSocket(s)
    return () => s.disconnect()
  }, [])

  useEffect(() => {
    if (socket && user) {
      socket.emit('join-room', user.role)
      socket.emit('join-user', user._id)
    }
  }, [socket, user])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
