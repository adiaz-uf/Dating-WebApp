

import { socket } from "./sockets";

let registeredUserId: string | null = null;
let isRegistered = false;
let pendingRegisterUserId: string | null = null;
let onRegisteredCallbacks: (() => void)[] = [];

function doRegister(userId: string) {
  if (socket && socket.connected) {
    socket.emit("register_reminder", { user_id: userId });
    registeredUserId = userId;
    isRegistered = true;
    onRegisteredCallbacks.forEach(cb => cb());
    onRegisteredCallbacks = [];
  } else {
    pendingRegisterUserId = userId;
  }
}

export function connectNotificationSocket(userId: string) {
  if (!isRegistered || registeredUserId !== userId) {
    doRegister(userId);
  }

  if (!(socket as any)._notificationHandlersRegistered) {
    
    socket.on("connect", () => {
      isRegistered = false;
      if (pendingRegisterUserId) {
        doRegister(pendingRegisterUserId);
        pendingRegisterUserId = null;
      } else if (registeredUserId) {
        doRegister(registeredUserId);
      }
    });
    socket.on("disconnect", () => {
      isRegistered = false;
    });
    (socket as any)._notificationHandlersRegistered = true;
  }
  return socket;
}

export function getNotificationSocket() {
  return socket;
}

export function onNotificationSocketRegistered(cb: () => void) {
  if (isRegistered) {
    cb();
  } else {
    onRegisteredCallbacks.push(cb);
  }
}
