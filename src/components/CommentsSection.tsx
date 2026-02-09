import { useState, useEffect } from "react";
import { Send, User as UserIcon, Trash2, MessageCircle, ThumbsUp, ThumbsDown, Flag, MoreHorizontal, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserProfileModal from "@/components/UserProfileModal";
import UserBadge from "@/components/UserBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarLoader } from "@/components/ui/BarLoader";

interface CommentsSectionProps {
  novelId: string;
  chapterId?: string;
}

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  read_count?: number; // Added read_count
}

interface CommentVote {
  user_id: string;
  comment_id: string;
  vote_type: number; // 1 or -1
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  profile?: UserProfile;
  replies?: Comment[];
  upvotes: number;
  downvotes: number;
  user_vote: number; // 0, 1, or -1
}

const CommentsSection = ({ novelId, chapterId }: CommentsSectionProps) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('popular');

  useEffect(() => {
    fetchComments();
  }, [novelId, chapterId, user?.id, sortBy]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Comments
      let query = supabase
        .from("comments" as any)
        .select("*")
        .eq("novel_id", novelId)
        .order("created_at", { ascending: true }); // Ascending for easier chronological tree building

      if (chapterId) {
        query = query.eq("chapter_id", chapterId);
      } else {
        query = query.is("chapter_id", null);
      }

      const { data: commentsData, error: commentsError } = await query;
      if (commentsError) throw commentsError;

      const rawComments = commentsData as any[];
      if (rawComments.length === 0) {
        setComments([]);
        return;
      }

      // 2. Fetch Profiles
      const userIds = [...new Set(rawComments.map((c) => c.user_id))];
      let profilesMap: Record<string, UserProfile> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles" as any)
          .select("id, username, avatar_url")
          .in("id", userIds);

        // 2b. Fetch Reading Counts (Badges)
        const { data: readingCounts } = await supabase.rpc("get_users_reading_counts" as any, {
          user_ids: userIds,
        });

        const countsMap: Record<string, number> = {};
        if (readingCounts && Array.isArray(readingCounts)) {
          readingCounts.forEach((r: any) => {
            countsMap[r.user_id] = r.count;
          });
        }

        profilesData?.forEach((p: any) => {
          profilesMap[p.id] = {
            ...p,
            read_count: countsMap[p.id] || 0,
          };
        });
      }

      // 3. Fetch Votes
      const commentIds = rawComments.map(c => c.id);
      let votesMap: Record<string, CommentVote[]> = {};
      if (commentIds.length > 0) {
        const { data: votesData } = await supabase
          .from("comment_votes" as any)
          .select("*")
          .in("comment_id", commentIds);

        votesData?.forEach((v: any) => {
          if (!votesMap[v.comment_id]) votesMap[v.comment_id] = [];
          votesMap[v.comment_id].push(v);
        });
      }

      // 4. Process Comments (Structure & Stats)
      const processedComments: Record<string, Comment> = {};

      rawComments.forEach(c => {
        const votes = votesMap[c.id] || [];
        const upvotes = votes.filter(v => v.vote_type === 1).length;
        const downvotes = votes.filter(v => v.vote_type === -1).length;
        const userVote = user ? (votes.find(v => v.user_id === user.id)?.vote_type || 0) : 0;

        processedComments[c.id] = {
          ...c,
          profile: profilesMap[c.user_id],
          replies: [],
          upvotes,
          downvotes,
          user_vote: userVote,
        };
      });

      // 5. Build Tree
      const rootComments: Comment[] = [];
      rawComments.forEach(c => {
        const comment = processedComments[c.id];
        if (comment.parent_id && processedComments[comment.parent_id]) {
          processedComments[comment.parent_id].replies?.push(comment);
        } else {
          rootComments.push(comment);
        }
      });

      // Sort root comments based on selected option
      switch (sortBy) {
        case 'newest':
          rootComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'oldest':
          rootComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'popular':
          rootComments.sort((a, b) => {
            const scoreA = a.upvotes - a.downvotes;
            const scoreB = b.upvotes - b.downvotes;
            if (scoreA === scoreB) {
              // Create secondary sort by newest if scores are equal
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return scoreB - scoreA;
          });
          break;
      }

      setComments(rootComments);

    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const postComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to post a comment." });
      return;
    }

    try {
      const { error } = await supabase.from("comments" as any).insert({
        user_id: user.id,
        novel_id: novelId,
        chapter_id: chapterId || null,
        parent_id: parentId || null,
        content: content.trim(),
      });

      if (error) throw error;

      toast({ title: "Success", description: "Comment posted!" });
      fetchComments(); // Refresh to show new comment
      return true;
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post comment.",
        variant: "destructive",
      });
      return false;
    }
  };

  const editComment = async (commentId: string, newContent: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("comments" as any)
        .update({ content: newContent.trim() })
        .eq("id", commentId)
        .eq("user_id", user.id); // Ensure ownership

      if (error) throw error;

      toast({ title: "Updated", description: "Comment updated successfully." });
      fetchComments();
      return true;
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update comment.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const handleDelete = (commentId: string) => {
    setCommentToDelete(commentId);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!commentToDelete) return;

    try {
      const { error } = await supabase.from("comments" as any).delete().eq("id", commentToDelete);
      if (error) throw error;
      toast({ title: "Deleted", description: "Comment deleted." });
      fetchComments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete comment.", variant: "destructive" });
    } finally {
      setIsDeleteModalOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleVote = async (commentId: string, type: 1 | -1) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to vote." });
      return;
    }

    try {

      // Check if vote exists
      const { data, error: queryError } = await supabase
        .from("comment_votes" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("comment_id", commentId)
        .maybeSingle();
      if (queryError) throw queryError;

      const existingVote = data as unknown as (CommentVote & { id: string }) | null;

      if (existingVote) {
        if (existingVote.vote_type === type) {
          // Toggle off (delete)
          const { error } = await supabase.from("comment_votes" as any).delete().eq("id", existingVote.id);
          if (error) throw error;
        } else {
          // Change vote
          const { error } = await supabase.from("comment_votes" as any).update({ vote_type: type }).eq("id", existingVote.id);
          if (error) throw error;
        }
      } else {
        // Create vote
        const { error } = await supabase.from("comment_votes" as any).insert({
          user_id: user.id,
          comment_id: commentId,
          vote_type: type,
        });
        if (error) throw error; // Could trigger unique constraint race condition
      }

      fetchComments(); // Refresh votes
    } catch (error: any) {
      console.error("Error voting:", error);
      toast({ title: "Error", description: "Failed to update vote.", variant: "destructive" });
    }
  };

  const handleReport = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to report a comment.",
        variant: "destructive",
      });
      return;
    }
    setReportingCommentId(commentId);
    setIsReportModalOpen(true);
  };

  const submitReport = async (reason: string) => {
    if (!reportingCommentId || !user) return;

    try {
      const { error } = await supabase.from("comment_reports" as any).insert({
        user_id: user.id,
        comment_id: reportingCommentId,
        reason: reason.trim(),
      });
      if (error) throw error;
      toast({ title: "Reported", description: "Comment has been reported for review." });
      setIsReportModalOpen(false);
      setReportingCommentId(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to report comment.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <UserProfileModal
        userId={selectedUserId}
        isOpen={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        onSubmit={submitReport}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={executeDelete}
      />

      <h3 className="text-xl font-semibold">Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</h3>

      {/* Main Comment Input */}
      {user ? (
        <CommentInput
          onSubmit={async (content) => {
            const success = await postComment(content);
            if (success) setNewComment("");
            return success;
          }}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="bg-muted/30 p-4 rounded-lg text-center text-muted-foreground">
          Please <a href="/login" className="text-primary hover:underline">login</a> to leave a comment.
        </div>
      )}

      {/* Sort Options */}
      <div className="flex gap-2 border-b border-border pb-2 justify-end">
        <Button
          variant={sortBy === 'newest' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSortBy('newest')}
          className="text-xs h-8"
        >
          Newest
        </Button>
        <Button
          variant={sortBy === 'oldest' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSortBy('oldest')}
          className="text-xs h-8"
        >
          Oldest
        </Button>
        <Button
          variant={sortBy === 'popular' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSortBy('popular')}
          className="text-xs h-8"
        >
          Popular
        </Button>
      </div>

      {/* List Section */}
      <div className="space-y-6 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <BarLoader />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onReply={postComment}
              onEdit={editComment}
              onVote={handleVote}
              onDelete={handleDelete}
              onReport={handleReport}
              onUserClick={(userId) => {
                setSelectedUserId(userId);
                setIsProfileOpen(true);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Sub-components

const CommentInput = ({
  onSubmit,
  isSubmitting,
  placeholder = "Write a comment...",
  initialValue = "",
  onCancel
}: {
  onSubmit: (content: string) => Promise<boolean>;
  isSubmitting: boolean;
  placeholder?: string;
  initialValue?: string;
  onCancel?: () => void;
}) => {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await onSubmit(content);
    setContent("");
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] bg-card border-border placeholder:text-muted-foreground"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !content.trim()} className="gap-2">
          {isSubmitting ? <BarLoader /> : <Send className="w-4 h-4" />}
          Post
        </Button>
      </div>
    </form>
  );
};

const CommentItem = ({
  comment,
  currentUserId,
  isAdmin,
  onReply,
  onEdit,
  onVote,
  onDelete,
  onReport,
  onUserClick
}: {
  comment: Comment;
  currentUserId?: string;
  isAdmin?: boolean;
  onReply: (content: string, parentId: string) => Promise<boolean>;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onVote: (commentId: string, type: 1 | -1) => Promise<void>;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => Promise<void>;
  onUserClick: (userId: string) => void;
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [areRepliesVisible, setAreRepliesVisible] = useState(true);

  return (
    <div className="group animate-fade-in">
      <div className="flex gap-4">
        <Avatar
          className="w-10 h-10 border border-border mt-1 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onUserClick(comment.user_id)}
        >
          <AvatarImage src={comment.profile?.avatar_url || ""} />
          <AvatarFallback>
            <UserIcon className="w-5 h-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className="font-semibold text-sm text-foreground cursor-pointer hover:underline"
                onClick={() => onUserClick(comment.user_id)}
              >
                {comment.profile?.username || "Anonymous User"}
              </span>
              <UserBadge chapterCount={comment.profile?.read_count || 0} />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onReport(comment.id)}>
                  <Flag className="w-4 h-4 mr-2" /> Report
                </DropdownMenuItem>
                {(currentUserId === comment.user_id) && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                )}
                {(currentUserId === comment.user_id || isAdmin) && (
                  <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          {/* Content */}
          {isEditing ? (
            <div className="mt-2">
              <CommentInput
                initialValue={comment.content}
                isSubmitting={isSubmittingEdit}
                onCancel={() => setIsEditing(false)}
                onSubmit={async (content) => {
                  setIsSubmittingEdit(true);
                  const success = await onEdit(comment.id, content);
                  setIsSubmittingEdit(false);
                  if (success) setIsEditing(false);
                  return success;
                }}
              />
            </div>
          ) : (
            <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
              {comment.content}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {/* Voting */}
            <div className="flex items-center gap-1 border border-border rounded-full px-2 py-1 bg-background/50">
              <button
                onClick={() => onVote(comment.id, 1)}
                className={`hover:bg-muted p-1 rounded transition-colors ${comment.user_vote === 1 ? "text-primary" : ""}`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${comment.user_vote === 1 ? "fill-current" : ""}`} />
              </button>
              <span className={`min-w-[1ch] text-center font-medium ${comment.user_vote !== 0 ? "text-foreground" : ""}`}>
                {comment.upvotes - comment.downvotes}
              </span>
              <button
                onClick={() => onVote(comment.id, -1)}
                className={`hover:bg-muted p-1 rounded transition-colors ${comment.user_vote === -1 ? "text-destructive" : ""}`}
              >
                <ThumbsDown className={`w-3.5 h-3.5 ${comment.user_vote === -1 ? "fill-current" : ""}`} />
              </button>
            </div>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Reply
            </button>
          </div>

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-4 pl-4 border-l-2 border-border">
              <CommentInput
                placeholder={`Replying to ${comment.profile?.username || 'user'}...`}
                isSubmitting={isSubmittingReply}
                onCancel={() => setIsReplying(false)}
                onSubmit={async (content) => {
                  setIsSubmittingReply(true);
                  const success = await onReply(content, comment.id);
                  setIsSubmittingReply(false);
                  if (success) setIsReplying(false);
                  return success;
                }}
              />
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 text-sm">
              <button
                onClick={() => setAreRepliesVisible(!areRepliesVisible)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                {areRepliesVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {areRepliesVisible ? "Hide Replies" : `View ${comment.replies.length} Replies`}
              </button>

              {areRepliesVisible && (
                <div className="space-y-6 pl-4 border-l-2 border-border/50">
                  {comment.replies.map(reply => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUserId={currentUserId}
                      isAdmin={isAdmin}
                      onReply={onReply}
                      onEdit={onEdit}
                      onVote={onVote}
                      onDelete={onDelete}
                      onReport={onReport}
                      onUserClick={onUserClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => Promise<void>;
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    await onSubmit(reason);
    setIsSubmitting(false);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Comment</DialogTitle>
          <DialogDescription>
            Please tell us why you are reporting this comment.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Reason for reporting..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason.trim() || isSubmitting}>
            {isSubmitting ? <BarLoader /> : null}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteConfirmModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Comment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? <BarLoader /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsSection;
