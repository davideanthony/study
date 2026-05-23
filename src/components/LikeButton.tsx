"use client";

import { useOptimistic, useTransition } from "react";
import { toggleLike } from "@/app/appunti/[id]/actions";
import { HeartIcon } from "@/components/HeartIcon";

type LikeButtonProps = {
  noteId: string;
  initialLiked: boolean;
  initialCount: number;
  showCountBelow?: boolean;
};

export function LikeButton({
  noteId,
  initialLiked,
  initialCount,
  showCountBelow = true,
}: LikeButtonProps) {
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (current, liked: boolean) => ({
      liked,
      count: liked
        ? current.count + (current.liked ? 0 : 1)
        : current.count - (current.liked ? 1 : 0),
    }),
  );

  function handleClick() {
    const nextLiked = !state.liked;
    startTransition(() => {
      setOptimistic(nextLiked);
      void toggleLike(noteId);
    });
  }

  const countLabel =
    state.count === 0
      ? null
      : state.count === 1
        ? "1 mi piace"
        : `${state.count} mi piace`;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        aria-label={state.liked ? "Togli mi piace" : "Metti mi piace"}
        aria-pressed={state.liked}
        className="-ml-1 rounded-full p-1 transition hover:scale-110 active:scale-95 disabled:opacity-60"
      >
        <HeartIcon
          filled={state.liked}
          className={
            state.liked
              ? "text-[#e25555] drop-shadow-[0_1px_2px_rgba(226,85,85,0.35)]"
              : "text-foreground"
          }
        />
      </button>
      {showCountBelow && countLabel && (
        <p className="text-sm font-semibold text-foreground">{countLabel}</p>
      )}
    </div>
  );
}
