import React from 'react';
import { 
  Clock, CheckCircle2, Truck, Box, Sparkles, 
  FileCheck, ShieldCheck, XCircle, DollarSign, Package
} from 'lucide-react';
import { useLanguage } from '../i18n';

export default function StatusBadge({ status, size = "md" }) {
  const { tStatus } = useLanguage();

  const configs = {
    // Request & Lot Statuses
    "DRAFT": {
      textColor: "text-[#555555]",
      icon: Package,
      dot: "bg-[#555555]"
    },
    "Draft": {
      textColor: "text-[#555555]",
      icon: Package,
      dot: "bg-[#555555]"
    },
    "SUBMITTED": {
      textColor: "text-[#2FA084]",
      icon: Sparkles,
      dot: "bg-[#2FA084]"
    },
    "Submitted": {
      textColor: "text-[#2FA084]",
      icon: Sparkles,
      dot: "bg-[#2FA084]"
    },
    "AWAITING_OFFERS": {
      textColor: "text-[#555555]",
      icon: Clock,
      dot: "bg-[#2FA084]"
    },
    "Awaiting Offers": {
      textColor: "text-[#555555]",
      icon: Clock,
      dot: "bg-[#2FA084]"
    },
    "AVAILABLE": {
      textColor: "text-[#1F6F5F]",
      icon: Sparkles,
      dot: "bg-[#6FCF97]"
    },
    "MATCHED": {
      textColor: "text-[#2FA084]",
      icon: Sparkles,
      dot: "bg-[#2FA084]"
    },
    "OFFERS_RECEIVED": {
      textColor: "text-[#1F6F5F]",
      icon: Clock,
      dot: "bg-[#2FA084]"
    },
    "Offers Received": {
      textColor: "text-[#1F6F5F]",
      icon: Clock,
      dot: "bg-[#2FA084]"
    },
    "OFFER_RECEIVED": {
      textColor: "text-[#1F6F5F]",
      icon: Clock,
      dot: "bg-[#2FA084]"
    },
    "OFFER_ACCEPTED": {
      textColor: "text-[#1F6F5F]",
      icon: CheckCircle2,
      dot: "bg-[#6FCF97]"
    },
    "Offer Accepted": {
      textColor: "text-[#1F6F5F]",
      icon: CheckCircle2,
      dot: "bg-[#6FCF97]"
    },
    "PICKUP_SCHEDULED": {
      textColor: "text-[#2FA084]",
      icon: Clock,
      dot: "bg-[#2FA084]"
    },
    "Pickup Scheduled": {
      textColor: "text-[#2FA084]",
      icon: Clock,
      dot: "bg-[#2FA084]"
    },
    "HANDED_OVER": {
      textColor: "text-[#1F6F5F]",
      icon: Truck,
      dot: "bg-[#6FCF97]"
    },
    "Handed Over": {
      textColor: "text-[#1F6F5F]",
      icon: Truck,
      dot: "bg-[#6FCF97]"
    },
    "PAYMENT_COMPLETED": {
      textColor: "text-[#1F6F5F]",
      icon: DollarSign,
      dot: "bg-[#6FCF97]"
    },
    "COMPLETED": {
      textColor: "text-[#1F6F5F]",
      icon: CheckCircle2,
      dot: "bg-[#6FCF97]"
    },
    "Completed": {
      textColor: "text-[#1F6F5F]",
      icon: CheckCircle2,
      dot: "bg-[#6FCF97]"
    },
    "REJECTED": {
      textColor: "text-[#555555]",
      icon: XCircle,
      dot: "bg-[#555555]"
    },
    "CANCELLED": {
      textColor: "text-[#555555]",
      icon: XCircle,
      dot: "bg-[#555555]"
    },
    "UNDER_REVIEW": {
      textColor: "text-[#555555]",
      icon: Clock,
      dot: "bg-[#2FA084]"
    },

    // Recycler Verification Statuses
    "VERIFIED": {
      textColor: "text-[#1F6F5F]",
      icon: ShieldCheck,
      dot: "bg-[#6FCF97]"
    },
    "PENDING_VERIFICATION": {
      textColor: "text-[#555555]",
      icon: Clock,
      dot: "bg-[#555555]"
    },
    "SUSPENDED": {
      textColor: "text-[#555555]",
      icon: XCircle,
      dot: "bg-[#555555]"
    },

    // Offer Statuses
    "PENDING": {
      textColor: "text-[#555555]",
      icon: Clock,
      dot: "bg-[#555555]"
    },
    "ACCEPTED": {
      textColor: "text-[#1F6F5F]",
      icon: CheckCircle2,
      dot: "bg-[#6FCF97]"
    },
    "FLAGGED": {
      textColor: "text-[#555555]",
      icon: Clock,
      dot: "bg-[#555555]"
    },
    "EXPIRED": {
      textColor: "text-[#555555]",
      icon: Clock,
      dot: "bg-[#555555]"
    },

    // Handover & Legacy
    "In Transit": {
      textColor: "text-[#2FA084]",
      icon: Truck,
      dot: "bg-[#2FA084]"
    },
    "IN_TRANSIT": {
      textColor: "text-[#2FA084]",
      icon: Truck,
      dot: "bg-[#2FA084]"
    },
    "Received": {
      textColor: "text-[#1F6F5F]",
      icon: Box,
      dot: "bg-[#6FCF97]"
    },
    "Active": {
      textColor: "text-[#1F6F5F]",
      icon: CheckCircle2,
      dot: "bg-[#6FCF97]"
    },
    "PAID": {
      textColor: "text-[#1F6F5F]",
      icon: DollarSign,
      dot: "bg-[#6FCF97]"
    }
  };

  const config = configs[status] || {
    textColor: "text-[#555555]",
    icon: FileCheck,
    dot: "bg-[#555555]"
  };

  const IconComponent = config.icon;
  const isSmall = size === "sm";

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold bg-white border-2 border-[#D6E8DF] rounded-full transition-colors ${config.textColor} ${isSmall ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <IconComponent className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{tStatus(status)}</span>
    </span>
  );
}
