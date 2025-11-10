"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { updateUserProfile } from "@/lib/server/users";
import type { User } from "@/types";

interface EditProfileDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditProfileDialog({
  user,
  isOpen,
  onClose,
  onUpdate,
}: EditProfileDialogProps) {
  const [bio, setBio] = useState(user.bio ?? "");
  const [imageUrl, setImageUrl] = useState(user.imageUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(user.bannerUrl ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setImageUrl(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleBannerSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB");
      return;
    }

    setIsUploadingBanner(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setBannerUrl(data.url);
    } catch (error) {
      console.error("Error uploading banner:", error);
      setErrorMessage("Failed to upload banner. Please try again.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await updateUserProfile({
        bio: bio.trim() || undefined,
        image: imageUrl || undefined,
        bannerUrl: bannerUrl || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error ?? "Failed to update profile");
        return;
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Something went wrong while updating your profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleRemoveBanner = () => {
    setBannerUrl("");
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold">Edit Profile</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Banner */}
          <div className="relative h-48 bg-gray-200">
            {bannerUrl && (
              <img
                src={bannerUrl}
                alt="Banner preview"
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerSelect}
                className="hidden"
                disabled={isUploadingBanner}
              />
              <button
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploadingBanner}
                className="text-white px-4 py-2 rounded-full bg-black/70 hover:bg-black/90 disabled:opacity-50"
              >
                {isUploadingBanner ? "Uploading..." : "Change banner"}
              </button>
            </div>
            {bannerUrl && (
              <button
                onClick={handleRemoveBanner}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5"
                title="Remove banner"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Avatar */}
          <div className="px-4 -mt-16 mb-4">
            <div className="relative inline-block">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-300 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="text-white px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 disabled:opacity-50 text-sm"
                >
                  {isUploadingImage ? "Uploading..." : "Change"}
                </button>
              </div>
              {imageUrl && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5"
                  title="Remove avatar"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="px-4 pb-4 space-y-4">
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                maxLength={160}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {bio.length}/160
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

