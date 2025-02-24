"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  _id?: string;
  content: string;
  sender: string;
  timestamp: string;
  role: string;
}

export default function ChatApp() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("user");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");

    if (savedUsername && savedRole) {
      setUsername(savedUsername);
      setRole(savedRole);
      setIsLoggedIn(true);
    } else {
      alert("Welcome to DhrumiL Chat Bot!");
      const inputRole = prompt("Are you admin? (yes/no)")?.toLowerCase();
      if (inputRole === "yes") {
        const adminPassword = prompt("Enter admin password:");
        if (adminPassword === "DhrumiL") {
          setRole("admin");
          setUsername("Admin");
          localStorage.setItem("username", "Admin");
          localStorage.setItem("role", "admin");
          setIsLoggedIn(true);
        } else {
          alert("Incorrect admin password!");
        }
      } else {
        alert("You can chat as a user.");
        setUsername("User");
        setRole("user");
        localStorage.setItem("username", "User");
        localStorage.setItem("role", "user");
        setIsLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const socketInstance = io("http://localhost:3001", {
        query: { username, role },
      });

      socketInstance.on("connect", () => {
        console.log("Connected to server");
        socketInstance.emit("load-messages");
      });

      socketInstance.on("previous-messages", (previousMessages: Message[]) => {
        setMessages(previousMessages);
      });

      socketInstance.on("new-message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [isLoggedIn, username, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        content: newMessage,
        sender: username,
        role: role,
        timestamp: new Date().toISOString(),
      };
      socket.emit("send-message", messageData);
      setNewMessage("");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Chat ({role === "admin" ? "Admin" : "User"})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea
            id="scroll-area"
            className="h-[60vh] w-full rounded-md border p-4"
          >
            {messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`mb-4 flex ${
                  message.sender === username ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender === username
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">
                    {/* {message.sender} ({message.role}) */}
                    {message.sender}
                  </div>
                  <div className="w-full overflow-auto">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={sendMessage} className="flex w-full space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
