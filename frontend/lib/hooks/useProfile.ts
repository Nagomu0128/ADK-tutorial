"use client";

import { useState, useCallback, useEffect } from "react";
import type { UserProfile, UpdateProfileRequest } from "@/lib/types";
import * as api from "@/lib/api";

type UseProfileReturn = {
  readonly profile: UserProfile | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  readonly refresh: () => Promise<void>;
};

const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getProfile();
      setProfile(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      try {
        const result = await api.updateProfile(data);
        setProfile(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update profile");
      }
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, error, updateProfile, refresh };
};

export default useProfile;
