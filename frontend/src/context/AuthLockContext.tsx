import React, { createContext, useContext, useEffect, useState } from "react";
import { encryptionService } from "../services/encryptionService";

interface AuthLockContextType {
  isPinEnabled: boolean;
  isLocked: boolean;
  unlockWithPin: (pin: string) => Promise<boolean>;
  lockNow: () => void;
  enablePin: (pin: string) => Promise<void>;
  disablePin: (currentPin: string) => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
}

const AuthLockContext = createContext<AuthLockContextType | undefined>(undefined);

export const AuthLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(encryptionService.isPinEnabled());
  const [isLocked, setIsLocked] = useState<boolean>(encryptionService.isLocked());

  useEffect(() => {
    setIsPinEnabled(encryptionService.isPinEnabled());
    setIsLocked(encryptionService.isLocked());
  }, []);

  const unlockWithPin = async (pin: string): Promise<boolean> => {
    const valid = await encryptionService.verifyPin(pin);
    if (valid) {
      encryptionService.setLocked(false);
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lockNow = () => {
    if (isPinEnabled) {
      encryptionService.setLocked(true);
      setIsLocked(true);
    }
  };

  const enablePin = async (pin: string): Promise<void> => {
    await encryptionService.setPin(pin);
    setIsPinEnabled(true);
    setIsLocked(false);
  };

  const disablePin = async (currentPin: string): Promise<boolean> => {
    const valid = await encryptionService.verifyPin(currentPin);
    if (valid) {
      encryptionService.removePin();
      setIsPinEnabled(false);
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const changePin = async (oldPin: string, newPin: string): Promise<boolean> => {
    const valid = await encryptionService.verifyPin(oldPin);
    if (valid) {
      await encryptionService.setPin(newPin);
      return true;
    }
    return false;
  };

  return (
    <AuthLockContext.Provider
      value={{
        isPinEnabled,
        isLocked,
        unlockWithPin,
        lockNow,
        enablePin,
        disablePin,
        changePin,
      }}
    >
      {children}
    </AuthLockContext.Provider>
  );
};

export const useAuthLock = (): AuthLockContextType => {
  const context = useContext(AuthLockContext);
  if (!context) throw new Error("useAuthLock must be used within an AuthLockProvider");
  return context;
};
