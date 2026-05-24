"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/social/actions";

type FollowButtonProps = {
  targetUserId: string;
  initialFollowing: boolean;
};

export function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const [pending, startTransition] = useTransition();
  const [following, setFollowing] = useState(initialFollowing);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleFollow(targetUserId);
          setFollowing((f) => !f);
        })
      }
      className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
    >
      {following ? "Segui già" : "Segui"}
    </button>
  );
}
