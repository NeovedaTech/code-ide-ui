import  { useState } from "react";
/**
 * Reusable Modal Component
 *
 * Props:
 * - isOpen (boolean): Controls modal visibility
 * - onClose (function): Callback when modal closes
 * - onConfirm (function): Callback when confirm button is clicked
 * - title (string): Modal header text
 * - content (string or ReactNode): Modal body content
 * - confirmText (string): Text for confirm button (default: "Confirm")
 * - cancelText (string): Text for cancel button (default: "Cancel")
 * - confirmButtonColor (string): Tailwind color class for confirm button (default: "bg-green-600")
 * - size (string): Modal width size - 'sm', 'md', 'lg', 'xl' (default: 'md')
 * - closeOnBackdropClick (boolean): Close modal when clicking backdrop (default: true)
 */
import { Modal, Box, Button, Fade, Backdrop } from "@mui/material";

export const ConfirmBox = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor = "#16a34a", // tailwind green-600 equivalent
  closeOnBackdropClick = true,
  size = "sm",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  closeOnBackdropClick?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}) => {
  const sizeMap = {
    sm: "33%",
    md: "40%",
    lg: "60%",
    xl: "80%",
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={closeOnBackdropClick ? onClose : undefined}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: { backdropFilter: "blur(4px)" },
        },
      }}
    >
      <Fade in={isOpen} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: sizeMap[size],
            minWidth: sizeMap[size],
            maxWidth: sizeMap[size],
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          {/* Header */}
          <Box sx={{ fontSize: 20, fontWeight: 600, mb: 2 }}>
            {title}
          </Box>

          {/* Content */}
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              pt: 2,
              color: "text.secondary",
            }}
          >
            {content}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
            >
              {cancelText}
            </Button>

            <Button
              variant="contained"
              onClick={handleConfirm}
              sx={{
                backgroundColor: confirmButtonColor,
                "&:hover": {
                  backgroundColor: confirmButtonColor,
                  filter: "brightness(1.1)",
                },
              }}
            >
              {confirmText}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};


/**
 * Hook for managing modal state
 * Returns: { isOpen, openModal, closeModal }
 */
export const useConfirmBox = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
    toggleModal: () => setIsOpen((prev) => !prev),
  };
};