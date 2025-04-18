import React, { useState, useEffect, useRef, useCallback } from "react";

import { TMessage } from "@/services/actions/getMessages";
import { verifyAndExecuteLLMPublic, submitPrompt } from "@/services/actions";
import { useAccount } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { config } from "@/app/wagmi";
import { ChatMessage } from "./ChatMessage";
import { MessageAnimation } from "@/components/animations";
import { ConversationModal } from "./ConversationModal";
import { createPortal } from "react-dom";
import { AvaPayment__factory } from "@/typechain-types/factories/AvaPayment__factory";
import { Switch } from "@headlessui/react";
import { getSessionWithPrice } from "@/actions/getSessionWithPrice";
import { sha256 } from "viem";

type TProps = {
  messages: TMessage[];
  className?: string;
  queryNewMessages: () => Promise<void>;
  showOnlyUserMessages: boolean;
  setShowOnlyUserMessages: (showOnlyUserMessages: boolean) => void;
  isGameEnded: boolean;
};

type TransactionStatus = "idle" | "pending" | "error";

// const BASE_CONTRACT_AVATOKEN = process.env.NEXT_PUBLIC_BASE_CONTRACT_AVATOKEN;
const BASE_CONTRACT_AVAPAYMENT =
  process.env.NEXT_PUBLIC_ETHEREUM_CONTRACT_ADDRESS;

export const Chat = ({
  messages,
  queryNewMessages,
  showOnlyUserMessages,
  setShowOnlyUserMessages,
  isGameEnded,
}: TProps) => {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [error, setError] = useState<string>("");
  const { address } = useAccount();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);
  const lastMessageContentRef = useRef<string | null>(null);
  const [selectedMessageTxHash, setSelectedMessageTxHash] = useState<
    string | null
  >(null);
  const [textareaHeight, setTextareaHeight] = useState(40);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  //   const avaTokenContract = {
  //     address: BASE_CONTRACT_AVATOKEN as `0x${string}`,
  //     abi: AVA__factory.abi,
  //   };
  const avaPaymentContract = {
    address: BASE_CONTRACT_AVAPAYMENT as `0x${string}`,
    abi: AvaPayment__factory.abi,
  };

  const handleSend = async () => {
    try {
      if (!address) {
        setError("Please connect your wallet first");
        return;
      }

      if (!prompt.trim()) {
        setError("Please enter a message");
        return;
      }

      setStatus("pending");
      setError("");

      const { price, sessionId } = await getSessionWithPrice(address);

      const hashedPrompt = sha256(Buffer.from(prompt, "utf-8"));

      const hash = await writeContract(config, {
        ...avaPaymentContract,
        functionName: "buyIn",
        args: [hashedPrompt],
        value: BigInt(price),
      });
      console.log({ hash });

      await submitPrompt(sessionId, hash, prompt, address);
      await waitForTransactionReceipt(config, { hash });
      const llmRes = await verifyAndExecuteLLMPublic(hash);
      if (llmRes.success) {
        await queryNewMessages();
        setStatus("idle");
        setPrompt("");
      } else {
        setError(llmRes.error ?? "Something went wrong");
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      setStatus("error");
      setError(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  };

  // Initial scroll on mount
  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0) {
      lastMessageContentRef.current = messages[messages.length - 1].content;
    }
  }, []);

  // Handle new messages
  useEffect(() => {
    if (messages.length > 0) {
      const currentLastMessage = messages[messages.length - 1];

      // Check if the last message content is different
      if (currentLastMessage.content !== lastMessageContentRef.current) {
        scrollToBottom();
        lastMessageRef.current = currentLastMessage.id;
      }

      lastMessageContentRef.current = currentLastMessage.content;
    }
  }, [messages]);

  // Add effect to refresh messages when toggle changes
  useEffect(() => {
    queryNewMessages();
  }, [showOnlyUserMessages, queryNewMessages]);

  // Modify the toggle handler to refresh messages immediately
  const handleToggleUserMessages = useCallback(
    async (checked: boolean) => {
      setShowOnlyUserMessages(checked);
      // Messages will be refreshed by the effect in Main component
    },
    [setShowOnlyUserMessages]
  );

  const renderModal = useCallback(() => {
    if (!selectedMessageTxHash) return null;

    return createPortal(
      <ConversationModal
        messageId={selectedMessageTxHash}
        onClose={() => setSelectedMessageTxHash(null)}
      />,
      document.body
    );
  }, [selectedMessageTxHash]);

  return (
    <div className="flex flex-col h-full bg-[#1a1b26]/95 rounded-3xl backdrop-blur-xl border border-purple-500/20 p-6 space-y-6">
      {/* Header - Messages Toggle */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-3 bg-[#2e1065]/20 px-4 py-2 rounded-full">
          <span className="text-sm font-medium text-gray-300">Show My Messages Only</span>
          <Switch
            checked={showOnlyUserMessages}
            onChange={handleToggleUserMessages}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
              showOnlyUserMessages ? "bg-purple-600" : "bg-gray-700"
            }`}
          >
            <span className={`${
              showOnlyUserMessages ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300`} />
          </Switch>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="space-y-6">
          {messages.map((message) => {
            const messageKey = `${message.id}-${message.content}`;
            const isNew = message === messages[messages.length - 1];
            return isNew ? (
              <MessageAnimation key={`anim-${messageKey}`}>
                <ChatMessage
                  message={message}
                  onSelect={(msg) => setSelectedMessageTxHash(msg.txHash)}
                />
              </MessageAnimation>
            ) : (
              <ChatMessage
                key={messageKey}
                message={message}
                onSelect={(msg) => setSelectedMessageTxHash(msg.txHash)}
              />
            );
          })}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Input Area */}
      {!isGameEnded && (
        <div className="relative">
          {error && (
            <div className="w-full mb-3 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              {error}
            </div>
          )}
          <div className="flex gap-3 items-start">
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                const target = e.target;
                target.style.height = "40px";
                const newHeight = Math.min(target.scrollHeight, 200);
                target.style.height = `${newHeight}px`;
                setTextareaHeight(newHeight);
              }}
              placeholder="Type a message..."
              disabled={status === "pending"}
              className={`w-full px-6 bg-[#2e1065]/10 border border-purple-500/20 focus:border-purple-500/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-[15px] transition-all duration-300 resize-none text-gray-100 placeholder-gray-500 ${
                textareaHeight > 40
                  ? "leading-normal py-3 rounded-2xl"
                  : "rounded-full"
              }`}
              style={{
                height: `${textareaHeight}px`,
                minHeight: "50px",
                maxHeight: "200px",
              }}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "40px";
                const newHeight = Math.min(target.scrollHeight, 200);
                target.style.height = `${newHeight}px`;
                setTextareaHeight(newHeight);
              }}
            />
            <button
              onClick={handleSend}
              disabled={status === "pending"}
              className={`flex-shrink-0 bg-[#2e1065] hover:bg-[#3b0764] text-white p-2 h-10 w-10 flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-300 ${
                textareaHeight > 40 ? "rounded-xl" : "rounded-full"
              }`}
            >
              {status === "pending" ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  stroke="white"
                  fill="none"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
      
      {renderModal()}
    </div>
  );
};
