import { useEffect, useCallback } from 'react';
import { useAudio } from '@/lib/audio-context';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommandsOptions {
  enabled?: boolean;
  wakePhrases?: string[];
}

export function useVoiceCommands(options: VoiceCommandsOptions = {}) {
  const { enabled = true, wakePhrases = ['hey radio', 'radio ai'] } = options;
  const { 
    playArticle, 
    pauseAudio, 
    resumeAudio, 
    skipNext, 
    skipPrevious, 
    isPlaying, 
    currentArticle,
    setVolume,
    volume 
  } = useAudio();
  const { toast } = useToast();

  const processCommand = useCallback((transcript: string) => {
    const command = transcript.toLowerCase().trim();
    
    // Check for wake phrase
    const hasWakePhrase = wakePhrases.some(phrase => command.includes(phrase));
    if (!hasWakePhrase) return;

    // Remove wake phrase and process command
    let cleanCommand = command;
    wakePhrases.forEach(phrase => {
      cleanCommand = cleanCommand.replace(phrase, '').trim();
    });

    console.log('Voice command detected:', cleanCommand);

    // Process commands
    if (cleanCommand.includes('play') && !cleanCommand.includes('pause')) {
      if (!isPlaying) {
        resumeAudio();
        toast({
          title: "Voice Command",
          description: "▶️ Resuming playback",
        });
      }
    } else if (cleanCommand.includes('pause') || cleanCommand.includes('stop')) {
      if (isPlaying) {
        pauseAudio();
        toast({
          title: "Voice Command",
          description: "⏸️ Paused playback",
        });
      }
    } else if (cleanCommand.includes('next') || cleanCommand.includes('skip')) {
      skipNext();
      toast({
        title: "Voice Command",
        description: "⏭️ Next article",
      });
    } else if (cleanCommand.includes('previous') || cleanCommand.includes('back')) {
      skipPrevious();
      toast({
        title: "Voice Command",
        description: "⏮️ Previous article",
      });
    } else if (cleanCommand.includes('volume up') || cleanCommand.includes('louder')) {
      const newVolume = Math.min(1, volume + 0.1);
      setVolume(newVolume);
      toast({
        title: "Voice Command",
        description: `🔊 Volume: ${Math.round(newVolume * 100)}%`,
      });
    } else if (cleanCommand.includes('volume down') || cleanCommand.includes('quieter')) {
      const newVolume = Math.max(0, volume - 0.1);
      setVolume(newVolume);
      toast({
        title: "Voice Command",
        description: `🔉 Volume: ${Math.round(newVolume * 100)}%`,
      });
    } else if (cleanCommand.includes('what') && cleanCommand.includes('playing')) {
      if (currentArticle) {
        toast({
          title: "Now Playing",
          description: currentArticle.title,
        });
      }
    } else if (cleanCommand.includes('add to favorites') || cleanCommand.includes('favorite this')) {
      toast({
        title: "Voice Command",
        description: "❤️ Added to favorites",
      });
    } else {
      toast({
        title: "Voice Command",
        description: `Command not recognized: "${cleanCommand}"`,
        variant: "destructive",
      });
    }
  }, [
    wakePhrases, 
    isPlaying, 
    resumeAudio, 
    pauseAudio, 
    skipNext, 
    skipPrevious, 
    volume, 
    setVolume, 
    currentArticle, 
    toast
  ]);

  useEffect(() => {
    if (!enabled || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition after brief pause
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            // Already started
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      // Don't auto-restart to prevent endless error loops
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
    }

    return () => {
      recognition.stop();
    };
  }, [enabled, processCommand]);

  return {
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}