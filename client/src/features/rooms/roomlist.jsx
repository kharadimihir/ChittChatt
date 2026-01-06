import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, MessageCircle, Plus, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoom from "./createroom";
import { useLocation } from "../location/useLocation";
import { toast } from "sonner";
import {
  createRoom,
  deleteRoom,
  getMyActiveRoom,
  getNearbyRooms,
} from "@/services/axios";

const RoomList = () => {
  const navigate = useNavigate();

  const [handle, setHandle] = useState("");
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [hasActiveRoom, setHasActiveRoom] = useState(false);

  const { location, loading: locationLoading, getLocation } = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  // Prevent create room without location
  const handleCreateRoomClick = () => {
    if (!location) {
      toast.error("Please enable location to create a room");
      return;
    }

    if (hasActiveRoom) {
      toast.error("You already have an active room");
      return;
    }

    setIsCreateOpen(true);
  };

  const handleDeleteRoom = (roomId) => {
    toast.warning("Delete this room?", {
      action: {
        label: "Delete",
        onClick: async () => {
          await deleteRoom(roomId);
          setRooms((prev) => prev.filter((r) => r._id !== roomId));
          setHasActiveRoom(false);
          toast.success("Room deleted");
        },
      },
    });
  };

  // Load handle
  useEffect(() => {
    if (user?.handle) {
      setHandle(user.handle);
    }
  }, []);

  // Check if user already has an active room
  useEffect(() => {
    const checkActiveRoom = async () => {
      try {
        const res = await getMyActiveRoom();
        setHasActiveRoom(res.data.hasActiveRoom);
      } catch {
        // silent fail
      }
    };
    checkActiveRoom();
  }, []);

  // Fetch nearby rooms
  useEffect(() => {
    if (!location) return;

    const fetchRooms = async () => {
      try {
        setRoomsLoading(true);
        const res = await getNearbyRooms(location.lat, location.lng);
        setRooms(res.data.rooms);
      } catch {
        toast.error("Failed to load nearby rooms");
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchRooms();
  }, [location]);

  const handleJoinRoom = (room) => {
    localStorage.setItem("activeRoom", JSON.stringify(room));
    navigate("/chat");
  };

  const handleLogOut = () => {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white/40 backdrop-blur-md sticky top-0 z-10 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-xl rotate-3">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-primary">
            ChittChaat
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-muted-foreground">
              Current Handle
            </span>
            <span className="text-sm font-bold text-primary">{handle}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("setup")}
            className="cursor-pointer rounded-full bg-white/50 hover:bg-white/70 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogOut}
            className="cursor-pointer rounded-full bg-accent/30 text-accent opacity-80 transition-all duration-300 hover:opacity-100 hover:bg-accent/50 hover:scale-105 active:scale-95"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">
              Nearby Rooms
            </h1>
            <p className="text-muted-foreground italic">
              Fresh chats happening right now.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {!location && (
              <Button
                variant="outline"
                onClick={getLocation}
                className="h-12 cursor-pointer"
              >
                {locationLoading ? "Getting location..." : "Enable Location"}
              </Button>
            )}

            <Button
              onClick={handleCreateRoomClick}
              disabled={hasActiveRoom}
              className="cursor-pointer h-12 px-6 bg-primary shadow-lg disabled:opacity-50"
            >
              <Plus className="mr-2 h-5 w-5" />
              {hasActiveRoom ? "Room Active" : "Create Room"}
            </Button>
          </div>
        </div>

        {/* STATES */}
        {roomsLoading && (
          <p className="text-center text-muted-foreground">
            Loading nearby rooms...
          </p>
        )}

        {!roomsLoading && rooms.length === 0 && (
          <p className="text-center text-muted-foreground">
            No nearby rooms found. Be the first to create one 👋
          </p>
        )}

        {/* ROOMS GRID */}
        {!roomsLoading && rooms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card
                key={room._id}
                className="group border-none bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col"
              >
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-secondary text-primary border-none font-bold rounded-lg uppercase tracking-widest text-[10px]">
                    {room.tag}
                  </Badge>

                  <CardTitle className="text-2xl font-bold leading-tight tracking-tight">
                    {room.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex items-center justify-between mt-auto">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent"
                      >
                        {i + 1}
                      </div>
                    ))}

                    <div className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center text-[10px] font-bold">
                      {room.users ? `+${room.users}` : "+0"}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {room.createdBy?._id === user?.id && (
                      <Button
                        onClick={() => handleDeleteRoom(room._id)}
                        variant="outline"
                        className="cursor-pointer rounded-full border-2 border-destructive/20 text-destructive font-bold hover:bg-destructive hover:text-white transition-colors"
                      >
                        Delete
                      </Button>
                    )}

                    <Button
                      onClick={() => handleJoinRoom(room)}
                      variant="outline"
                      className=" cursor-pointer rounded-full border-2 border-primary/20 text-primary font-bold hover:bg-primary hover:text-white transition-colors"
                    >
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* CREATE ROOM MODAL */}
      <CreateRoom
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={async ({ title, tag }) => {
          try {
            await createRoom({
              title,
              tag,
              lat: location.lat,
              lng: location.lng,
            });

            toast.success("Room created");
            setHasActiveRoom(true);

            const res = await getNearbyRooms(location.lat, location.lng);
            setRooms(res.data.rooms);
          } catch {
            toast.error("Failed to create room");
          }
        }}
      />
    </div>
  );
};

export default RoomList;
