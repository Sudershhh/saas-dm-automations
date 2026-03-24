import axios from "axios";
import { useState } from "react";

export const useSubscription = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const onSubscribe = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.get("/api/payment");
      if (response.data.status === 200 && response.data.session_url) {
        window.location.href = response.data.session_url as string;
        return;
      }
    } catch {
      // fall through to reset loading
    }
    setIsProcessing(false);
  };

  return { onSubscribe, isProcessing };
};
