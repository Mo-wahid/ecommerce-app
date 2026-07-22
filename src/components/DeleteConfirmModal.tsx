import { Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  itemName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <AlertDialogContent isOpen={isOpen} onOpenChange={(open) => !open && onCancel()} isDismissable={!isDeleting}>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-500">
          <AlertTriangle className="w-5 h-5" />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently remove the item and its data from the server.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onPress={onCancel} isDisabled={isDeleting}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onPress={onConfirm}
          isDisabled={isDeleting}
          variant="destructive"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isDeleting ? "Deleting..." : "Delete"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
