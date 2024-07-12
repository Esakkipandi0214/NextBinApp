import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout";

export default function Component() {
  const messageData = {
    messages: [
      {
        name: "Olivia Davis",
        email: "olivia.davis@example.com",
        lastOrdered: "October 8, 2023",
        messageDetails: [
          {
            date: "October 8, 2023 9:15 AM",
            text: "Hi, let's have a meeting tomorrow to discuss the project."
          }
        ]
      },
      {
        name: "John Doe",
        email: "john.doe@example.com",
        lastOrdered: "October 3, 2023",
        messageDetails: [
          {
            date: "October 3, 2023 11:00 AM",
            text: "Hey there, just wanted to follow up on the proposal I sent last week."
          }
        ]
      }
    ]
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Received Messages</h1>
        <div className="grid gap-6">
          {messageData.messages.map(({ name, email, lastOrdered, messageDetails }) => (
            <MessageCard
              key={email}
              name={name}
              email={email}
              lastOrdered={lastOrdered}
              messages={messageDetails}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

interface Message {
  date: string;
  text: string;
}

interface MessageCardProps {
  name: string;
  email: string;
  lastOrdered: string;
  messages: Message[];
}

const MessageCard: React.FC<MessageCardProps> = ({ name, email, lastOrdered, messages }) => {
  const lastOrderedDate = new Date(lastOrdered);
  const today = new Date();
  const daysSinceLastOrdered = Math.floor((today.getTime() - lastOrderedDate.getTime()) / (1000 * 3600 * 24));

  return (
    <div className="bg-background rounded-lg shadow p-6">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <div className="font-semibold">{name} ({daysSinceLastOrdered} days ago)</div>
              <div className="text-sm text-muted-foreground">{email}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <PhoneIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-4">
            {messages.map((message, index) => (
              <div className="grid gap-2" key={index}>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <div>{message.date}</div>
                </div>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {message.text}
                </div>
                <div className="text-sm text-muted-foreground">
                  Last ordered on: {lastOrdered}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2z" />
      <path d="M8 4v8l4-4h4" />
    </svg>
  );
}