import { cn } from "cn";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
			<DialogPrimitive.Content
				className={cn(
					"fixed top-1/2 left-1/2 z-50 grid max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border bg-background p-6 text-foreground shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
					className,
				)}
				{...props}
			>
				{children}
				<DialogPrimitive.Close className="absolute top-4 right-4 rounded-md p-1 opacity-70 transition hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring">
					<XIcon className="size-4" />
					<span className="sr-only">Tutup</span>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
}

export const DialogHeader = ({ className, ...p }: React.ComponentProps<"div">) => (
	<div className={cn("flex flex-col gap-1.5", className)} {...p} />
);
export const DialogFooter = ({ className, ...p }: React.ComponentProps<"div">) => (
	<div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...p} />
);
export const DialogTitle = ({
	className,
	...p
}: React.ComponentProps<typeof DialogPrimitive.Title>) => (
	<DialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...p} />
);
export const DialogDescription = ({
	className,
	...p
}: React.ComponentProps<typeof DialogPrimitive.Description>) => (
	<DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...p} />
);
