import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md forest-card text-center animate-surprise" data-testid="modal-success">
        <div className="p-8">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-serif font-bold mb-4" data-testid="text-success-title">
            Order Placed Successfully!
          </h2>
          <p className="text-muted-foreground mb-6" data-testid="text-success-message">
            Thank you for your purchase! We'll contact you soon with delivery details.
          </p>
          <Button 
            onClick={onClose}
            className="px-6 py-3 font-semibold"
            data-testid="button-continue-shopping"
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
