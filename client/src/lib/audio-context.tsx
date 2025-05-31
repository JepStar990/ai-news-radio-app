import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Article } from '@/types';

interface AudioState {
  currentArticle: Article | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  queue: Article[];
  queueIndex: number;
  volume: number;
  isLoading: boolean;
}

interface AudioContextType extends AudioState {
  playArticle: (article: Article) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  addToQueue: (article: Article) => void;
  removeFromQueue: (index: number) => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  setQueue: (articles: Article[], startIndex?: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audioElement] = useState(() => new Audio());
  const [state, setState] = useState<AudioState>({
    currentArticle: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    queue: [],
    queueIndex: -1,
    volume: 0.8,
    isLoading: false,
  });

  // Connect audio element to state
  useEffect(() => {
    const audio = audioElement;
    
    const updateTime = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const updateDuration = () => setState(prev => ({ ...prev, duration: audio.duration || 0 }));
    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleEnded = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleLoadStart = () => setState(prev => ({ ...prev, isLoading: true }));
    const handleCanPlay = () => setState(prev => ({ ...prev, isLoading: false }));

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioElement]);

  const playArticle = useCallback((article: Article) => {
    setState(prev => ({
      ...prev,
      currentArticle: article,
      isLoading: true,
      currentTime: 0,
    }));

    // Use the OpenAI text-to-speech API endpoint
    const audioUrl = `/api/articles/${article.id}/audio`;
    audioElement.src = audioUrl;
    audioElement.load();
    
    audioElement.play().catch(error => {
      console.error('Failed to play audio:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    });
  }, [audioElement]);

  const pauseAudio = useCallback(() => {
    audioElement.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, [audioElement]);

  const resumeAudio = useCallback(() => {
    audioElement.play().catch(console.error);
    setState(prev => ({ ...prev, isPlaying: true }));
  }, [audioElement]);

  const skipNext = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.queueIndex + 1;
      if (nextIndex < prev.queue.length) {
        const nextArticle = prev.queue[nextIndex];
        return {
          ...prev,
          currentArticle: nextArticle,
          queueIndex: nextIndex,
          currentTime: 0,
          isPlaying: true,
          isLoading: true,
        };
      }
      return prev;
    });
  }, []);

  const skipPrevious = useCallback(() => {
    setState(prev => {
      const prevIndex = prev.queueIndex - 1;
      if (prevIndex >= 0) {
        const prevArticle = prev.queue[prevIndex];
        return {
          ...prev,
          currentArticle: prevArticle,
          queueIndex: prevIndex,
          currentTime: 0,
          isPlaying: true,
          isLoading: true,
        };
      }
      return prev;
    });
  }, []);

  const addToQueue = useCallback((article: Article) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, article],
    }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.filter((_, i) => i !== index),
      queueIndex: prev.queueIndex > index ? prev.queueIndex - 1 : prev.queueIndex,
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
  }, []);

  const seekTo = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setQueue = useCallback((articles: Article[], startIndex = 0) => {
    setState(prev => ({
      ...prev,
      queue: articles,
      queueIndex: startIndex,
      currentArticle: articles[startIndex] || null,
    }));
  }, []);

  // Simulate audio progress
  useEffect(() => {
    if (state.isPlaying && !state.isLoading && state.currentArticle) {
      const interval = setInterval(() => {
        setState(prev => {
          const newTime = prev.currentTime + 1;
          if (newTime >= prev.duration) {
            // Auto-play next track
            const nextIndex = prev.queueIndex + 1;
            if (nextIndex < prev.queue.length) {
              return {
                ...prev,
                currentArticle: prev.queue[nextIndex],
                queueIndex: nextIndex,
                currentTime: 0,
                isLoading: true,
              };
            } else {
              return { ...prev, isPlaying: false, currentTime: 0 };
            }
          }
          return { ...prev, currentTime: newTime };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.isPlaying, state.isLoading]);

  const value: AudioContextType = {
    ...state,
    playArticle,
    pauseAudio,
    resumeAudio,
    skipNext,
    skipPrevious,
    addToQueue,
    removeFromQueue,
    setVolume,
    seekTo,
    setQueue,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
