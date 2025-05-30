"use client";
import { motion, AnimatePresence } from "framer-motion";
import { NumberTickerDemo, TypingAnimationDemo } from "@/components/animations";
import { getRecentMessages, TMessage } from "@/services/actions/getMessages";
import { Header } from "@/app/home/components/Header";
import { Chat } from "@/app/home/components/Chat/Chat";
import { useState, useCallback, useEffect } from "react";
import { ConversationModal } from "./Chat/ConversationModal";
import { useAccount } from "wagmi";
import { HowItWorks } from "./Chat/HowItWorks";
import { Stats } from "./Chat/Stats";
import { getGameState, TGameState } from "@/actions/getGameState";
import { getPrizePool } from "@/actions/getPrizePool";
import Image from "next/image";
import { useSession as useNextAuthSession } from 'next-auth/react';

type TProps = {
  messages: TMessage[];
  gameState: TGameState;
};

export const Main = (props: TProps) => {
  const [prizeFund, setPrizeFund] = useState<number>();
  const [messages, setMessages] = useState<TMessage[]>(props.messages);
  const [gameState, setGameState] = useState<TGameState>(props.gameState);
  const [selectedMessage, setSelectedMessage] = useState<TMessage | null>(null);
  const [showOnlyUserMessages, setShowOnlyUserMessages] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: session, status } = useNextAuthSession();

  const queryNewMessages = useCallback(async () => {
    const newMessages = await getRecentMessages(
      showOnlyUserMessages ? address : undefined
    );
    setMessages(newMessages);

    const newGameState = await getGameState();
    setGameState(newGameState);
  }, [showOnlyUserMessages, address]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(queryNewMessages, 5000);
    return () => clearInterval(interval);
  }, [queryNewMessages]);

  // Add this to debug the selected message
  useEffect(() => {
    if (selectedMessage) {
      console.log("Selected Message State:", selectedMessage);
      console.log(
        "Has fullConversation:",
        "fullConversation" in selectedMessage
      );
    }
  }, [selectedMessage]);

  useEffect(() => {
    const fetchPrizeFund = async () => {
      const prizeFund = await getPrizePool();
      setPrizeFund(prizeFund);
    };
    fetchPrizeFund();
  }, []);

  // Add this useEffect to log whenever session or status changes
  useEffect(() => {
    console.log('Session Status:', status);
    console.log('Session Data:', session);
    console.log('Wallet Connected:', isConnected);
    console.log('Wallet Address:', address);
  }, [session, status, isConnected, address]);

  const verifyToken = async () => {
    try {
      // Method 1: Check session endpoint
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();

      // Method 2: Check cookies
      const cookies = document.cookie;

      // Method 3: Check session object
      const currentSession = session;

      // Log all authentication data
      console.log('=== Authentication Data ===');
      console.log('1. Session Status:', status);
      console.log('2. Connected Address:', address);
      console.log('3. Session Data:', sessionData);
      console.log('4. Cookies:', cookies);
      console.log('5. Current Session:', currentSession);

      // Try to use the token
      const testResponse = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${sessionData.token.jti}`
        }
      });
      console.log('6. Test Response:', await testResponse.json());

    } catch (error) {
      console.error('Verification Error:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="p-4 space-y-2">
        <div className="mb-4 space-y-2">
          <p>Status: {status}</p>
          <p>Wallet: {address}</p>
          <button 
            onClick={verifyToken}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Verify Authentication
          </button>
        </div>

        <button 
          onClick={verifyToken}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!isConnected}
        >
          Verify Authentication
        </button>
      </div>

      {/* Main Content */}
      <Header gameState={gameState} prizeFund={prizeFund ?? 0} />
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column */}
        <motion.div
          className="hidden lg:block w-1/4 min-w-[300px] max-w-[400px] overflow-y-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            delay: 3.5, // Starts after the chat animation
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <HowItWorks />

          
        </motion.div>

        {/* Center Column */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 lg:px-8">
          <motion.div
            className="flex-shrink-0 text-center pb-4 lg:pb-8 max-w-3xl mx-auto w-full"
            initial={{ y: "50vh", translateY: "-50%" }}
            animate={{ y: 0, translateY: 0 }}
            transition={{
              duration: 0.5,
              delay: 2.5,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <NumberTickerDemo
              className="mb-4 lg:mb-8 text-2xl lg:text-3xl"
              prizeFund={prizeFund}
            />
            <div className="relative inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                <Image
                  src="/freysa.png"
                  alt="Freysa"
                  height={48}
                  width={48}
                  className="rounded-full"
                />
              </div>

              <div className="relative inline-block">
                <div className="bg-white rounded-[2rem] px-8 flex items-center h-[4.5rem] py-10 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                  <TypingAnimationDemo />
                  <div
                    className="absolute left-[-12px] top-1/2 -translate-y-1/2"
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "white",
                      clipPath:
                        "polygon(100% 0, 0 50%, 100% 100%, 100% 55%, 100% 45%)",
                    }}
                  >
                    <div className="w-full h-full bg-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 pb-8 min-h-0 flex justify-center">
            <motion.div
              className="h-full rounded-3xl overflow-hidden max-w-3xl w-full"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 3,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <Chat
                messages={messages}
                queryNewMessages={queryNewMessages}
                showOnlyUserMessages={showOnlyUserMessages}
                setShowOnlyUserMessages={setShowOnlyUserMessages}
                isGameEnded={gameState.isGameEnded}
              />
            </motion.div>
          </div>
        </div>

        {/* Right Column */}
        <div className="hidden lg:block w-1/4 min-w-[300px] max-w-[400px] overflow-y-auto">
          {/* Empty right column with same width as left */}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <ConversationModal
            messageId={selectedMessage.txHash}
            onClose={() => setSelectedMessage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
