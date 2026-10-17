import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	loading?: boolean;
	error?: string;
	onConfirm: () => void | Promise<void>;
	variant?: "destructive" | "default";
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmText = "Hapus",
	cancelText = "Batal",
	loading = false,
	error,
	onConfirm,
	variant = "destructive",
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{error && (
					<p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{error}
					</p>
				)}
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						disabled={loading}
						onClick={() => onOpenChange(false)}
					>
						{cancelText}
					</Button>
					<Button
						type="button"
						variant={variant}
						disabled={loading}
						onClick={async () => {
							await onConfirm();
						}}
					>
						{loading && <Loader2 className="animate-spin" />}
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
