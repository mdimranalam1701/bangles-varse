// Shared socket.io instance — avoids circular dependency between server.js and service files
let io = null;

export const setIO = (ioInstance) => {
    io = ioInstance;
};

export const getIO = () => {
    if (!io) {
        console.warn("Socket.io not initialized yet");
    }
    return io;
};
