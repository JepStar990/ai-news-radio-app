import { useAudio } from '@/lib/audio-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useAudioPlayer() {
  const audio = useAudio();
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async ({ articleId, progress, completed }: { 
      articleId: number; 
      progress: number; 
      completed: boolean;
    }) => {
      return await apiRequest('POST', '/api/history/progress', {
        articleId,
        progress,
        completed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
    },
  });

  const saveProgress = (articleId: number, progress: number, completed: boolean = false) => {
    updateProgressMutation.mutate({ articleId, progress, completed });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = (): number => {
    if (audio.duration === 0) return 0;
    return (audio.currentTime / audio.duration) * 100;
  };

  return {
    ...audio,
    saveProgress,
    formatTime,
    getProgressPercent,
    isBuffering: audio.isLoading,
  };
}
