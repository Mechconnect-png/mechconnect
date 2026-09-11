import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SocketService {
  private static io: Server | null = null;

  public static init(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
      }
    });

    this.io.on("connection", (socket: Socket) => {
      console.log(`[SOCKET] Connected: ${socket.id}`);

      // Join user and role specific rooms with deduplication check
      socket.on("join:user", (data: { userId: string; role: string; customerId?: string; mechanicId?: string }) => {
        if (!data || !data.userId) return;

        const userRoom = `user_${data.userId}`;
        socket.join(userRoom);

        if (data.role === "MECHANIC" && data.mechanicId) {
          const mechRoom = `mechanic_${data.mechanicId}`;
          if (!socket.rooms.has(mechRoom)) {
            socket.join(mechRoom);
            socket.join("available_mechanics");
            console.log(`[SOCKET] Mechanic joined: ${mechRoom}`);
          }
        } else if (data.role === "CUSTOMER" && data.customerId) {
          const custRoom = `customer_${data.customerId}`;
          if (!socket.rooms.has(custRoom)) {
            socket.join(custRoom);
            console.log(`[SOCKET] Customer joined: ${custRoom}`);
          }
        }
      });

      // Join specific booking room with deduplication check
      socket.on("join:booking", (bookingId: string) => {
        if (bookingId) {
          const bookingRoom = `booking_${bookingId}`;
          if (!socket.rooms.has(bookingRoom)) {
            socket.join(bookingRoom);
            console.log(`[SOCKET] Joined booking room: ${bookingRoom}`);
          }
        }
      });

      // Realtime Mechanic Location Stream with Backend Safety Guard
      socket.on("mechanic:location_update", async (data: { mechanicId: string; bookingId?: string; lat: number; lng: number }) => {
        if (data.bookingId) {
          try {
            const booking = await prisma.serviceRequest.findUnique({
              where: { id: data.bookingId },
              select: { status: true }
            });

            // BACKEND SAFETY GUARD: Only broadcast navigation updates if booking status is EN_ROUTE
            if (booking && booking.status !== "EN_ROUTE") {
              console.warn(`[SOCKET] Ignored location update for booking_${data.bookingId} because status is ${booking.status}`);
              return;
            }

            socket.to(`booking_${data.bookingId}`).emit("mechanic:location_changed", {
              mechanicId: data.mechanicId,
              lat: data.lat,
              lng: data.lng,
              timestamp: new Date().toISOString()
            });
          } catch (err) {
            console.error("[SOCKET] Error validating booking location update:", err);
          }
        }
      });

      // Realtime Chat Messaging (Persisted in SQLite)
      socket.on("chat:send_message", async (data: { bookingId: string; senderId: string; senderRole: string; message: string }) => {
        try {
          const dbMsg = await prisma.chatMessage.create({
            data: {
              serviceRequestId: data.bookingId,
              senderId: data.senderId,
              senderRole: data.senderRole,
              message: data.message
            }
          });

          const payload = {
            id: dbMsg.id,
            serviceRequestId: dbMsg.serviceRequestId,
            senderId: dbMsg.senderId,
            senderRole: dbMsg.senderRole,
            message: dbMsg.message,
            timestamp: dbMsg.timestamp.toISOString()
          };

          this.io?.to(`booking_${data.bookingId}`).emit("chat:new_message", payload);
          console.log(`[SOCKET] Chat message persisted & emitted for booking_${data.bookingId}`);
        } catch (err) {
          console.error("[SOCKET] Error persisting chat message:", err);
        }
      });

      socket.on("disconnect", () => {
        console.log(`[SOCKET] Disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  public static getIO(): Server {
    if (!this.io) {
      throw new Error("Socket.IO not initialized!");
    }
    return this.io;
  }

  public static notifyMechanicsNewRequest(mechanicIds: string[], requestData: any) {
    if (!this.io) return;
    mechanicIds.forEach(mechId => {
      this.io?.to(`mechanic_${mechId}`).emit("request:new", requestData);
    });
    // Also broadcast to available_mechanics room
    this.io.to("available_mechanics").emit("request:new", requestData);
  }

  public static notifyBookingStatusUpdate(bookingId: string, statusData: any) {
    if (!this.io) return;
    this.io.to(`booking_${bookingId}`).emit("booking:status_change", statusData);

    // Also notify customer user room if customerId is present in statusData.booking
    if (statusData.booking?.customerId) {
      this.io.to(`customer_${statusData.booking.customerId}`).emit("booking:status_change", statusData);
    }
    if (statusData.booking?.mechanicId) {
      this.io.to(`mechanic_${statusData.booking.mechanicId}`).emit("booking:status_change", statusData);
    }
  }
}
