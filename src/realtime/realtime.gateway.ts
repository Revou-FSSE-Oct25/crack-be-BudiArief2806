import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type {
  BookingEntity,
  BookingMessageEntity,
} from '../modules/bookings/entities/booking.entity';
import { AuthService } from '../modules/auth/auth.service';

type SocketUser = {
  id: string;
  role: string;
  doctorId?: string;
};

function resolveSocketOrigins() {
  return (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

@WebSocketGateway({
  cors: {
    origin: resolveSocketOrigins(),
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server!: Server;

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const user = await this.authService.resolveUserByToken(token);
      const socketUser: SocketUser = {
        id: user.id,
        role: user.role,
        doctorId: user.doctorId ?? undefined,
      };

      client.data.user = socketUser;
      client.join(this.userRoom(user.id));

      if (user.role === 'admin') {
        client.join(this.adminRoom());
      }

      if (user.doctorId) {
        client.join(this.doctorRoom(user.doctorId));
      }
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() body?: unknown) {
    return {
      ok: true,
      echo: body ?? null,
      connectedAs: client.data.user ?? null,
    };
  }

  broadcastBookingUpdated(booking: BookingEntity, reason: string) {
    const payload = {
      type: 'booking.updated' as const,
      reason,
      booking,
    };

    this.server.to(this.adminRoom()).emit('booking.updated', payload);

    if (booking.userId) {
      this.server.to(this.userRoom(booking.userId)).emit('booking.updated', payload);
    }

    if (booking.doctorId) {
      this.server.to(this.doctorRoom(booking.doctorId)).emit('booking.updated', payload);
    }
  }

  broadcastBookingDeleted(params: {
    bookingId: string;
    userId?: string | null;
    doctorId?: string;
  }) {
    const payload = {
      type: 'booking.deleted' as const,
      reason: 'deleted' as const,
      bookingId: params.bookingId,
      userId: params.userId ?? null,
      doctorId: params.doctorId ?? null,
    };

    this.server.to(this.adminRoom()).emit('booking.deleted', payload);

    if (params.userId) {
      this.server.to(this.userRoom(params.userId)).emit('booking.deleted', payload);
    }

    if (params.doctorId) {
      this.server.to(this.doctorRoom(params.doctorId)).emit('booking.deleted', payload);
    }
  }

  broadcastBookingMessage(params: {
    booking: BookingEntity;
    message: BookingMessageEntity;
  }) {
    const payload = {
      type: 'booking.message.created' as const,
      bookingId: params.booking.id,
      message: params.message,
    };

    this.server.to(this.adminRoom()).emit('booking.message.created', payload);

    if (params.booking.userId) {
      this.server
        .to(this.userRoom(params.booking.userId))
        .emit('booking.message.created', payload);
    }

    if (params.booking.doctorId) {
      this.server
        .to(this.doctorRoom(params.booking.doctorId))
        .emit('booking.message.created', payload);
    }
  }

  private extractToken(client: Socket) {
    const authToken =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : null;

    if (authToken) return authToken;

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice('Bearer '.length).trim();
    }

    return null;
  }

  private adminRoom() {
    return 'role:admin';
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }

  private doctorRoom(doctorId: string) {
    return `doctor:${doctorId}`;
  }
}
