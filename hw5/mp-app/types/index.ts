// Domain Models
export interface User {
  userId: string;
  name: string;
  imageUrl?: string;
  bannerUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface Author {
  userId: string;
  name: string;
  imageUrl?: string;
}

export interface Post {
  id: string;
  author: Author;
  text: string;
  createdAt: string;
  relativeTime: string;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  viewerHasLiked?: boolean;
}

// Component Props
export interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export interface ProfileTabsProps {
  user: Pick<User, "userId" | "postsCount">;
  isOwnProfile: boolean;
}

export interface PostCardProps {
  post: Post;
}

export interface Draft {
  id: string;
  text: string;
  createdAt: string;
  relativeTime: string;
}

export interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
}

