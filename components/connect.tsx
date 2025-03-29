// Frontend\components\connect.tsx
"use client";
import { getSolanaBalance } from "@/app/actions/solana";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';

import { getConnectedAddress, solanaConfig } from "@/app/wagmi";

export function ConnectWallet() {
  const [isSolanaConnected, setIsSolanaConnected] = useState(false);
  const { isConnected: isEthereumConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleSolanaConnect = () => {
    setIsSolanaConnected(true);
  };

  const handleSolanaDisconnect = () => {
    setIsSolanaConnected(false);
  };

  const handleDisconnect = () => {
    if (isSolanaConnected) {
      handleSolanaDisconnect();
    } else {
      disconnect();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="connect-wallet-btn shine-slow flex items-center justify-center w-56 text-white hover:text-white/90 rounded-full px-4 py-2.5"
        >
          {isSolanaConnected ? (
            <SolanaWallet onDisconnect={handleSolanaDisconnect} />
          ) : isEthereumConnected ? (
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal }) => {
                if (!account || !chain) return null;
                return (
                  <div className="flex items-center gap-2 w-full">
                    <div className="wallet-icon-container flex items-center justify-center w-8 h-8 rounded-full overflow-hidden p-1.5">
                      <Image 
                        src="/ethereum.png" 
                        alt="Ethereum" 
                        width={24} 
                        height={24} 
                        className="object-contain" 
                        priority
                      />
                    </div>
                    <button onClick={openAccountModal} className="flex items-center gap-2">
                      <span className="text-sm opacity-60">{chain.name}</span>
                      <span className="text-sm font-medium">{account.displayName}</span>
                    </button>
                  </div>
                );
              }}
            </ConnectButton.Custom>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium">Connect Wallet</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="wallet-dropdown w-56 p-1.5 rounded-lg"
      >
        {(isSolanaConnected || isEthereumConnected) ? (
          <DropdownMenuItem 
            className="flex items-center gap-3 px-3.5 py-3 hover:bg-red-500/10 rounded-md cursor-pointer text-red-400 hover:text-red-300"
            onSelect={handleDisconnect}
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Disconnect {isSolanaConnected ? 'Solana' : 'Ethereum'}</span>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem 
              onClick={handleSolanaConnect}
              className="wallet-dropdown-item flex items-center gap-3 px-3.5 py-3 rounded-md cursor-pointer"
            >
              <div className="wallet-icon-container flex items-center justify-center w-8 h-8 rounded-full overflow-hidden p-1.5">
                <Image 
                  src="/solana.png" 
                  alt="Solana" 
                  width={32} 
                  height={32} 
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <span className="text-white text-sm font-medium">Connect Solana</span>
            </DropdownMenuItem>

            <div className="wallet-divider" />

            <DropdownMenuItem 
              className="wallet-dropdown-item flex items-center gap-3 px-3.5 py-3 rounded-md cursor-pointer"
            >
              <div className="wallet-icon-container flex items-center justify-center w-8 h-8 rounded-full overflow-hidden p-1.5">
                <Image 
                  src="/ethereum.png" 
                  alt="Ethereum" 
                  width={32} 
                  height={32}
                  className="object-contain w-full h-full" 
                  priority
                />
              </div>
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal }) => {
                  return (
                    <button 
                      onClick={openConnectModal} 
                      className="text-white text-sm font-medium"
                    >
                      Connect Ethereum
                    </button>
                  );
                }}
              </ConnectButton.Custom>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface SolanaWalletProps {
  onDisconnect: () => void;
}

export function SolanaWallet({ onDisconnect }: SolanaWalletProps) {
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [solanaAddress, setSolanaAddress] = useState("");

  useEffect(() => {
    getConnectedAddress().then((address) => {
      setSolanaAddress(address);
    });
  }, []);

  useEffect(() => {
    if (!solanaAddress) return;
    async function fetchBalance() {
      const { balance, success } = await getSolanaBalance(solanaAddress);
      if (success && balance) setSolanaBalance(balance);
    }
    fetchBalance();
  }, [solanaAddress]);

  if (!solanaAddress) return null;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="wallet-icon-container flex items-center justify-center w-8 h-8 rounded-full overflow-hidden p-1.5">
        <Image 
          src="/solana.png" 
          alt="" 
          width={24} 
          height={24} 
          className="object-contain" 
          priority
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{solanaBalance} SOL</span>
        <span className="text-xs opacity-60">{solanaConfig.network === "devnet" ? "Devnet" : ""}</span>
        <span className="text-sm opacity-60">
          {solanaAddress.slice(0, 4)}...{solanaAddress.slice(-4)}
        </span>
      </div>
    </div>
  );
}