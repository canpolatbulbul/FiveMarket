import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle2, TrendingUp, Shield } from "lucide-react";

export default function BecomeFreelancerModal({ open, onOpenChange, onConfirm, loading }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Briefcase className="h-6 w-6 text-indigo-600" />
            Become a Freelancer
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Start offering your services and grow your freelance business on FiveMarket
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900">Create Services</h4>
                <p className="text-sm text-slate-600">
                  List your skills and services with custom packages and pricing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900">Earn Money</h4>
                <p className="text-sm text-slate-600">
                  Get paid for your work with secure transactions and timely payouts
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900">Build Your Reputation</h4>
                <p className="text-sm text-slate-600">
                  Gain reviews, ratings, and certifications to grow your profile
                </p>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-900">
              <strong>Note:</strong> You'll still be able to buy services and switch between
              buying and selling services anytime.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? "Processing..." : "Become a Freelancer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
