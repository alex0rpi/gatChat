import { useEffect, useRef } from 'react';
import io, { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';

export const useSocket = (
  uri: string,
  opts?: Partial<ManagerOptions & SocketOptions> | undefined
): Socket => {
  const socketRef = useRef(io(uri, opts)); // the socket object is created here.
  //   useRef so it survives re-renders of the component that calls useSocket.
  const socket = socketRef.current;

  useEffect(() => {
    return () => {
      socket.close(); //  Close the socket when the component unmounts.
    };
  }, [socket]);
  //   We want to close the socket when there is a change in the socket

  return socket;
};

// We want this hook to return the socket object through which we talk to the server.
// But it is not connected yet.
// We'll include this returned socket object in our context provider object.
